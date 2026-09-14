from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, BlockViewSet, FloorViewSet, UnitViewSet, MilestoneViewSet

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('blocks', BlockViewSet, basename='block')
router.register('floors', FloorViewSet, basename='floor')
router.register('units', UnitViewSet, basename='unit')
router.register('milestones', MilestoneViewSet, basename='milestone')

urlpatterns = router.urls
