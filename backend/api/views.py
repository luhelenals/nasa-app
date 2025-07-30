from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status, generics
import requests, os
from datetime import date, datetime
from base.models import *
from .serializers import *
from django.db.models import Avg, Max, Min, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getData(request):
    items = Asteroid.objects.all()
    serializer = AsteroidSerializer(items, many=True)
    return Response(serializer.data)

# views.py
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAsteroidInfo(request, id):
    logger.info(f"Requisição para getAsteroidInfo com id: {id}")
    try:
        asteroid = Asteroid.objects.get(id=id) # Use .get() para pegar 404 mais diretamente no try/except
        logger.info(f"Asteroide encontrado: {asteroid.name} (ID: {asteroid.id})")
        serializer = AsteroidSerializer(asteroid)
        return Response(serializer.data)
    except Asteroid.DoesNotExist:
        logger.error(f"Asteroide com id={id} não encontrado no banco de dados.")
        return Response({"detail": "Não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar asteroide com id={id}: {e}")
        return Response({"detail": "Erro interno do servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getIndicators(request):
    asteroids = Asteroid.objects.all()

    # 1. Quantidade total de asteroides na base
    total_asteroids = asteroids.count()

    if total_asteroids == 0:
        return Response({
            "message": "Nenhum asteroide encontrado na base de dados para gerar indicadores.",
            "total_asteroids": 0,
            "unique_asteroids_by_name": 0,
            "unique_potentially_hazardous_asteroids": 0 # Adicionado para caso vazio
        }, status=status.HTTP_200_OK)

    # 1.1 Quantidade de asteroides únicos pelo nome
    unique_asteroids_by_name = asteroids.values('name').distinct().count()

    # 2. Média da velocidade dos asteroides
    avg_velocity = asteroids.aggregate(Avg('relative_velocity_km_per_second'))['relative_velocity_km_per_second__avg']

    # 3. Maior velocidade de asteroide e nome dele
    max_velocity_obj = asteroids.order_by('-relative_velocity_km_per_second').first()
    max_velocity_data = {
        'velocity_km_s': max_velocity_obj.relative_velocity_km_per_second,
        'name': max_velocity_obj.name
    } if max_velocity_obj else None

    # 4. Menor velocidade de asteroide e nome dele
    min_velocity_obj = asteroids.order_by('relative_velocity_km_per_second').first()
    min_velocity_data = {
        'velocity_km_s': min_velocity_obj.relative_velocity_km_per_second,
        'name': min_velocity_obj.name
    } if min_velocity_obj else None

    # 5. Média do diâmetro dos asteroides (usando a média entre min e max)
    avg_min_diameter = asteroids.aggregate(Avg('estimated_diameter_min_meters'))['estimated_diameter_min_meters__avg']
    avg_max_diameter = asteroids.aggregate(Avg('estimated_diameter_max_meters'))['estimated_diameter_max_meters__avg']
    avg_diameter = (avg_min_diameter + avg_max_diameter) / 2 if avg_min_diameter is not None and avg_max_diameter is not None else None

    # 6. Maior diâmetro e nome do asteroide com maior diâmetro
    max_estimated_diameter_obj = asteroids.order_by('-estimated_diameter_max_meters').first()
    max_diameter_data = {
        'diameter_meters': max_estimated_diameter_obj.estimated_diameter_max_meters,
        'name': max_estimated_diameter_obj.name
    } if max_estimated_diameter_obj else None

    # 7. Menor diâmetro e nome do asteroide com menor diâmetro
    min_estimated_diameter_obj = asteroids.order_by('estimated_diameter_min_meters').first()
    min_diameter_data = {
        'diameter_meters': min_estimated_diameter_obj.estimated_diameter_min_meters,
        'name': min_estimated_diameter_obj.name
    } if min_estimated_diameter_obj else None

    # 8. Quantidade de asteroides por dia registrado na base
    asteroids_by_date = asteroids.values('imported_date').annotate(count=Count('id')).order_by('imported_date')
    
    # Formatar para um dicionário legível
    asteroids_by_date_formatted = {
        item['imported_date'].strftime('%Y-%m-%d'): item['count']
        for item in asteroids_by_date
    }

    # 9. Média de quantidade de asteroides por dia
    num_unique_dates = asteroids.values('imported_date').distinct().count()
    avg_asteroids_per_day = total_asteroids / num_unique_dates if num_unique_dates > 0 else 0

    # 10. Quantidade de asteroides únicos (pelo nome) que são potencialmente perigosos
    unique_potentially_hazardous_asteroids = asteroids.filter(is_potentially_hazardous_asteroid=True).values('name').distinct().count()

    response_data = {
        "total_asteroids": total_asteroids,
        "unique_asteroids_by_name": unique_asteroids_by_name,
        "unique_potentially_hazardous_asteroids": unique_potentially_hazardous_asteroids,
        "avg_asteroids_per_day": round(avg_asteroids_per_day, 2),
        "avg_velocity_km_per_second": round(avg_velocity, 2) if avg_velocity else None,
        "max_velocity": max_velocity_data,
        "min_velocity": min_velocity_data,
        "avg_diameter_meters": round(avg_diameter, 2) if avg_diameter else None,
        "max_estimated_diameter": max_diameter_data,
        "min_estimated_diameter": min_diameter_data,
        "asteroids_by_date": asteroids_by_date_formatted,
    }

    return Response(response_data, status=status.HTTP_200_OK)

User = get_user_model()

# ENDPOINT DE CADASTRO DE USUÁRIO
class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]