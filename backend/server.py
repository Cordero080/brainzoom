from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Synapse — Cosmic Brain API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class BrainRegion(BaseModel):
    id: str
    name: str
    latin: str
    function: str
    summary: str
    coords: List[float]  # [x, y, z] coordinates in our 3D model
    color: str
    danger: Optional[str] = None
    fun_fact: Optional[str] = None


class NeuralStructure(BaseModel):
    id: str
    name: str
    category: str  # neuron | synapse | pathway
    summary: str
    detail: str
    metrics: dict


# ---------- Static neuroscience data ----------
BRAIN_REGIONS: List[dict] = [
    {
        "id": "frontal-lobe",
        "name": "Frontal Lobe",
        "latin": "Lobus frontalis",
        "function": "Executive control, voluntary movement, language production",
        "summary": "The cortex of foresight. Plans actions, regulates emotion, hosts Broca's speech area.",
        "coords": [0.0, 1.2, 1.4],
        "color": "#D4AF37",
        "danger": "Damage impairs decision-making and personality (cf. Phineas Gage).",
        "fun_fact": "The prefrontal cortex finishes maturing only around age 25.",
    },
    {
        "id": "parietal-lobe",
        "name": "Parietal Lobe",
        "latin": "Lobus parietalis",
        "function": "Spatial reasoning, somatosensory integration, attention",
        "summary": "Builds your map of self in space — touch, proprioception, body schema.",
        "coords": [0.0, 1.6, -0.4],
        "color": "#0A84FF",
        "fun_fact": "Lesions can cause hemispatial neglect — patients ignore one side of the world.",
    },
    {
        "id": "temporal-lobe",
        "name": "Temporal Lobe",
        "latin": "Lobus temporalis",
        "function": "Auditory processing, language comprehension, memory",
        "summary": "Hosts the hippocampus and Wernicke's area. Where sound becomes meaning.",
        "coords": [1.5, 0.6, 0.3],
        "color": "#F2F2F2",
        "fun_fact": "Patient H.M. lost the ability to form new memories after temporal lobe surgery.",
    },
    {
        "id": "occipital-lobe",
        "name": "Occipital Lobe",
        "latin": "Lobus occipitalis",
        "function": "Visual processing — edges, motion, color, depth",
        "summary": "Six layers of striate cortex (V1) decompose your world into oriented edges.",
        "coords": [0.0, 0.9, -1.7],
        "color": "#0A84FF",
        "fun_fact": "About 30% of your cortex is devoted to vision.",
    },
    {
        "id": "cerebellum",
        "name": "Cerebellum",
        "latin": "Cerebellum",
        "function": "Motor coordination, balance, motor learning",
        "summary": "Holds half of all neurons in the brain in 10% of its mass. A timing prodigy.",
        "coords": [0.0, -0.3, -1.4],
        "color": "#D4AF37",
        "fun_fact": "Cerebellar Purkinje cells have the most elaborate dendrites in the body.",
    },
    {
        "id": "brainstem",
        "name": "Brainstem",
        "latin": "Truncus encephali",
        "function": "Heartbeat, breathing, sleep, arousal — the autopilot",
        "summary": "Medulla, pons, midbrain. The bridge to the spinal cord; without it, no consciousness.",
        "coords": [0.0, -0.9, -0.3],
        "color": "#F2F2F2",
        "fun_fact": "All twelve cranial nerves except the olfactory enter or exit through here.",
    },
    {
        "id": "thalamus",
        "name": "Thalamus",
        "latin": "Thalamus",
        "function": "Sensory relay — the switchboard of the brain",
        "summary": "Every sense except smell passes through the thalamus before reaching cortex.",
        "coords": [0.0, 0.5, 0.0],
        "color": "#D4AF37",
        "fun_fact": "Damage to the thalamus can produce permanent coma.",
    },
    {
        "id": "hippocampus",
        "name": "Hippocampus",
        "latin": "Hippocampus",
        "function": "Memory consolidation, spatial navigation",
        "summary": "A seahorse-shaped structure that converts experience into long-term memory.",
        "coords": [0.9, 0.2, 0.2],
        "color": "#0A84FF",
        "fun_fact": "London taxi drivers have measurably enlarged hippocampi.",
    },
]


NEURAL_STRUCTURES: List[dict] = [
    {
        "id": "soma",
        "name": "Soma (Cell Body)",
        "category": "neuron",
        "summary": "The metabolic heart of the neuron, housing the nucleus.",
        "detail": "The soma integrates incoming dendritic signals and generates action potentials at the axon hillock once threshold is reached.",
        "metrics": {"diameter": "10–25 μm", "resting potential": "−70 mV"},
    },
    {
        "id": "dendrite",
        "name": "Dendrite",
        "category": "neuron",
        "summary": "Branched antennae receiving thousands of synaptic inputs.",
        "detail": "Dendritic spines bristle with receptors. A single pyramidal cell may host 10,000+ synapses across its arbor.",
        "metrics": {"spines per cell": "~10,000", "length": "up to 1 mm"},
    },
    {
        "id": "axon",
        "name": "Axon",
        "category": "neuron",
        "summary": "The transmission line — carrying action potentials to distant targets.",
        "detail": "Wrapped in myelin sheaths produced by oligodendrocytes (CNS) or Schwann cells (PNS), enabling saltatory conduction.",
        "metrics": {"length": "1 μm to 1 m", "conduction speed": "1–120 m/s"},
    },
    {
        "id": "synapse",
        "name": "Chemical Synapse",
        "category": "synapse",
        "summary": "A 20-nanometer gap where neurotransmitters cross between neurons.",
        "detail": "When an action potential arrives, voltage-gated Ca²⁺ channels open, vesicles fuse with the presynaptic membrane, and neurotransmitters diffuse across the cleft.",
        "metrics": {"cleft width": "~20 nm", "vesicle count": "~200 per terminal"},
    },
    {
        "id": "action-potential",
        "name": "Action Potential",
        "category": "synapse",
        "summary": "An all-or-nothing electrical spike that races down the axon at up to 120 m/s.",
        "detail": "Driven by sequential opening of voltage-gated Na⁺ and K⁺ channels, it depolarizes the membrane from −70 mV to +40 mV in a millisecond.",
        "metrics": {"duration": "~1 ms", "amplitude": "100 mV"},
    },
    {
        "id": "spinal-cord",
        "name": "Spinal Cord",
        "category": "pathway",
        "summary": "The information highway between brain and body — 45 cm of dense white matter.",
        "detail": "Descending motor tracts (corticospinal) and ascending sensory tracts (dorsal column, spinothalamic) carry signals to and from limbs at saltatory speed.",
        "metrics": {"length": "~45 cm", "tracts": "31 spinal nerve pairs"},
    },
    {
        "id": "motor-endplate",
        "name": "Neuromuscular Junction",
        "category": "pathway",
        "summary": "Where the nervous system tells muscle to contract.",
        "detail": "Acetylcholine released by motor neurons binds nicotinic receptors on the muscle fiber, triggering Ca²⁺ release and contraction.",
        "metrics": {"transmitter": "Acetylcholine", "delay": "~0.5 ms"},
    },
]


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Synapse — Cosmic Brain API is online."}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


@api_router.get("/regions", response_model=List[BrainRegion])
async def get_regions():
    return BRAIN_REGIONS


@api_router.get("/regions/{region_id}", response_model=BrainRegion)
async def get_region(region_id: str):
    for r in BRAIN_REGIONS:
        if r["id"] == region_id:
            return r
    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail="Region not found")


@api_router.get("/structures", response_model=List[NeuralStructure])
async def get_structures():
    return NEURAL_STRUCTURES


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
