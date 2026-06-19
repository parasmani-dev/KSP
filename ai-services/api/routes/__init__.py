# Expose the routers directly from the routes module
from .predictions import router as predictions_router
from .recommendations import router as recommendations_router
