from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import requests, os
from datetime import datetime, date
from base.models import *
from .serializers import *

@api_view(['GET'])
def getData(request):
    items = Asteroid.objects.all()
    serializer = AsteroidSerializer(items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def importData(request):
    import_date_str = request.data.get('import_date')

    if import_date_str:
        try:
            # Converter a string da data para um objeto date
            target_date = date.fromisoformat(import_date_str)
            current_date_str = import_date_str # Usar a data fornecida para a URL da NASA
        except ValueError:
            return Response(
                {"error": "Formato de data inválido. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        # Se a data não foi fornecida, usar a data de hoje
        target_date = date.today()
        current_date_str = target_date.strftime('%Y-%m-%d')

    nasa_api_key = os.environ.get('NASA_API_KEY')
    nasa_api_url = f"https://api.nasa.gov/neo/rest/v1/feed?start_date={target_date}&end_date={target_date}&api_key={nasa_api_key}"

    try:
        response = requests.get(nasa_api_url)
        response.raise_for_status() # Levanta HTTPError para 4xx/5xx responses
        data = response.json()
    except requests.exceptions.RequestException as e:
        return Response({"error": f"Erro ao conectar ou receber dados da API da NASA: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    near_earth_objects_for_today = data.get('near_earth_objects', {}).get(current_date_str, [])

    imported_asteroids_count = 0
    errors = []

    for neo in near_earth_objects_for_today:
        # Extrair os dados necessários
        name = neo.get('name')
        absolute_magnitude_h = neo.get('absolute_magnitude_h')
        is_potentially_hazardous_asteroid = neo.get('is_potentially_hazardous_asteroid')
        is_sentry_object = neo.get('is_sentry_object')

        # Diâmetro estimado em metros
        estimated_diameter_data = neo.get('estimated_diameter', {}).get('meters', {})
        estimated_diameter_min_meters = estimated_diameter_data.get('estimated_diameter_min')
        estimated_diameter_max_meters = estimated_diameter_data.get('estimated_diameter_max')

        # Dados de aproximação para a velocidade relativa
        close_approach_data = neo.get('close_approach_data', [])
        relative_velocity_km_per_second = None

        if close_approach_data:
            first_approach = close_approach_data[0]
            velocity_str = first_approach.get('relative_velocity', {}).get('kilometers_per_second')
            if velocity_str:
                relative_velocity_km_per_second = float(velocity_str)

        # Validar se todos os campos obrigatórios foram encontrados
        # Removemos close_approach_date da validação aqui, pois não o pegamos mais da API
        if all([name, estimated_diameter_min_meters is not None, estimated_diameter_max_meters is not None,
                relative_velocity_km_per_second is not None, absolute_magnitude_h is not None,
                is_potentially_hazardous_asteroid is not None, is_sentry_object is not None]):
            
            # Criar o dicionário de dados para o serializer
            asteroid_data = {
                'name': name,
                'estimated_diameter_min_meters': estimated_diameter_min_meters,
                'estimated_diameter_max_meters': estimated_diameter_max_meters,
                'relative_velocity_km_per_second': relative_velocity_km_per_second,
                'absolute_magnitude_h': absolute_magnitude_h,
                'is_potentially_hazardous_asteroid': is_potentially_hazardous_asteroid,
                'is_sentry_object': is_sentry_object,
                'imported_date': target_date
            }

            serializer = AsteroidSerializer(data=asteroid_data)
            if serializer.is_valid():
                serializer.save()
                imported_asteroids_count += 1
            else:
                errors.append({"name": name, "errors": serializer.errors})
        else:
            errors.append({"name": name if name else "Unknown Asteroid", "message": "Dados incompletos ou inválidos para este asteroide."})

    if errors:
        return Response(
            {"message": f"{imported_asteroids_count} asteroides importados com sucesso, mas ocorreram erros para alguns:", "errors": errors},
            status=status.HTTP_207_MULTI_STATUS # Partial content
        )
    return Response(
        {"message": f"{imported_asteroids_count} asteroides importados com sucesso!"},
        status=status.HTTP_201_CREATED
    )