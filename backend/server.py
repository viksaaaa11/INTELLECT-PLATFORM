from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'dubai-realestate-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Create the main app
app = FastAPI(title="Dubai Real Estate SaaS Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============= MODELS =============

class CompanyCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    license_number: Optional[str] = None

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    license_number: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "agent"
    company_id: Optional[str] = None
    rera_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str
    role: str = "agent"  # agent, team_manager, company_admin, super_admin
    rera_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    company_id: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    rera_id: Optional[str] = None
    is_active: bool
    created_at: datetime

class LeadCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    nationality: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    property_type: Optional[str] = None
    area: Optional[str] = None
    source: Optional[str] = None
    price: float = 0.0

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    nationality: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    property_type: Optional[str] = None
    area: Optional[str] = None
    status: str = "new"  # new, qualified, contacted, client, closed, lost
    source: Optional[str] = None
    price: float = 0.0
    assigned_to: Optional[str] = None
    is_available: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    lead_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[EmailStr] = None

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: Optional[str] = None
    lead_id: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    status: str = "active"
    assigned_to: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteCreate(BaseModel):
    entity_type: str  # lead, client, deal
    entity_id: str
    text: str

class Note(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    entity_type: str
    entity_id: str
    user_id: str
    text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DealCreate(BaseModel):
    client_id: str
    property_name: str
    deal_value: float
    commission_total: Optional[float] = None
    agent_commission: Optional[float] = None

class Deal(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: Optional[str] = None
    client_id: str
    property_name: str
    deal_value: float
    commission_total: Optional[float] = 0.0
    agent_commission: Optional[float] = 0.0
    status: str = "viewing"  # viewing, offer, booking, closed, cancelled
    closing_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wallet(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    balance: float = 0.0

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    type: str  # debit, credit
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WalletTopUp(BaseModel):
    amount: float

class PropertyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    location: str
    area: Optional[str] = None
    bedrooms: int = 0
    bathrooms: int = 0
    size_sqm: float = 0
    property_type: str = "apartment"
    image_url: Optional[str] = None
    is_featured: bool = False

class Property(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    price: float
    location: str
    area: Optional[str] = None
    bedrooms: int = 0
    bathrooms: int = 0
    size_sqm: float = 0
    property_type: str = "apartment"
    image_url: Optional[str] = None
    is_featured: bool = False
    broker_id: Optional[str] = None
    company_id: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionPlan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float
    features: List[str]
    leads_per_month: int
    is_recommended: bool = False

class UserSubscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_name: str
    price: float
    status: str = "active"
    starts_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============= HELPERS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str, company_id: Optional[str]) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "company_id": company_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc: dict) -> dict:
    """Remove MongoDB _id and convert datetime to ISO string"""
    if doc is None:
        return None
    doc.pop('_id', None)
    for key, value in doc.items():
        if isinstance(value, datetime):
            doc[key] = value.isoformat()
    return doc

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse, status_code=201)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role,
        company_id=user_data.company_id,
        rera_id=user_data.rera_id
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    # Create wallet for user
    wallet = Wallet(user_id=user.id, balance=1000.0)  # Start with 1000 AED
    wallet_doc = wallet.model_dump()
    await db.wallets.insert_one(wallet_doc)
    
    token = create_token(user.id, user.email, user.role, user.company_id)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            company_id=user.company_id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            role=user.role,
            rera_id=user.rera_id,
            is_active=user.is_active,
            created_at=user.created_at
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    token = create_token(user_doc['id'], user_doc['email'], user_doc['role'], user_doc.get('company_id'))
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_doc['id'],
            company_id=user_doc.get('company_id'),
            name=user_doc['name'],
            email=user_doc['email'],
            phone=user_doc.get('phone'),
            role=user_doc['role'],
            rera_id=user_doc.get('rera_id'),
            is_active=user_doc.get('is_active', True),
            created_at=user_doc['created_at']
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user['sub']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return UserResponse(**user_doc)

# ============= COMPANY ROUTES =============

@api_router.post("/companies", response_model=Company, status_code=201)
async def create_company(company_data: CompanyCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can create companies")
    
    company = Company(**company_data.model_dump())
    doc = company.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.companies.insert_one(doc)
    return company

@api_router.get("/companies", response_model=List[Company])
async def get_companies(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can view all companies")
    
    companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    for c in companies:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return companies

@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: str, current_user: dict = Depends(get_current_user)):
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if isinstance(company.get('created_at'), str):
        company['created_at'] = datetime.fromisoformat(company['created_at'])
    return company

# ============= USER ROUTES =============

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user['role'] != 'super_admin':
        query['company_id'] = current_user.get('company_id')
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    for u in users:
        if isinstance(u.get('created_at'), str):
            u['created_at'] = datetime.fromisoformat(u['created_at'])
    return users

@api_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check permissions
    if current_user['role'] not in ['super_admin', 'company_admin']:
        if current_user['sub'] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    allowed_fields = ['name', 'phone', 'rera_id', 'is_active']
    if current_user['role'] in ['super_admin', 'company_admin']:
        allowed_fields.extend(['role', 'company_id'])
    
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    if update_fields:
        await db.users.update_one({"id": user_id}, {"$set": update_fields})
    
    updated = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return UserResponse(**updated)

# ============= LEADS ROUTES =============

@api_router.post("/leads", response_model=Lead, status_code=201)
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    lead = Lead(**lead_data.model_dump())
    
    # Super admin creates available leads
    if current_user['role'] == 'super_admin':
        lead.is_available = True
        lead.company_id = None
    else:
        lead.company_id = current_user.get('company_id')
        lead.is_available = False
    
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    return lead

@api_router.get("/leads", response_model=List[Lead])
async def get_leads(
    available_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    if available_only:
        query['is_available'] = True
    elif current_user['role'] != 'super_admin':
        # Users see their company's leads + available leads
        query['$or'] = [
            {'company_id': current_user.get('company_id')},
            {'is_available': True}
        ]
    
    leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
    for l in leads:
        if isinstance(l.get('created_at'), str):
            l['created_at'] = datetime.fromisoformat(l['created_at'])
    return leads

@api_router.get("/leads/{lead_id}", response_model=Lead)
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if isinstance(lead.get('created_at'), str):
        lead['created_at'] = datetime.fromisoformat(lead['created_at'])
    return lead

@api_router.put("/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    allowed_fields = ['status', 'assigned_to', 'notes']
    if current_user['role'] == 'super_admin':
        allowed_fields.extend(['price', 'is_available', 'company_id'])
    
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    if update_fields:
        await db.leads.update_one({"id": lead_id}, {"$set": update_fields})
    
    updated = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Lead(**updated)

@api_router.post("/leads/{lead_id}/buy")
async def buy_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if not lead.get('is_available'):
        raise HTTPException(status_code=400, detail="Lead is not available for purchase")
    
    # Check wallet balance
    wallet = await db.wallets.find_one({"user_id": current_user['sub']}, {"_id": 0})
    if not wallet:
        raise HTTPException(status_code=400, detail="Wallet not found")
    
    lead_price = lead.get('price', 0)
    if wallet['balance'] < lead_price:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Deduct from wallet
    new_balance = wallet['balance'] - lead_price
    await db.wallets.update_one({"user_id": current_user['sub']}, {"$set": {"balance": new_balance}})
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user['sub'],
        amount=lead_price,
        type="debit",
        description=f"Lead purchase: {lead['name']}"
    )
    trans_doc = transaction.model_dump()
    trans_doc['created_at'] = trans_doc['created_at'].isoformat()
    await db.transactions.insert_one(trans_doc)
    
    # Update lead
    await db.leads.update_one({"id": lead_id}, {
        "$set": {
            "is_available": False,
            "assigned_to": current_user['sub'],
            "company_id": current_user.get('company_id'),
            "status": "new"
        }
    })
    
    return {"message": "Lead purchased successfully", "new_balance": new_balance}

# ============= CLIENTS ROUTES =============

@api_router.post("/clients", response_model=Client, status_code=201)
async def create_client(client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    client = Client(
        **client_data.model_dump(),
        company_id=current_user.get('company_id'),
        assigned_to=current_user['sub']
    )
    doc = client.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.clients.insert_one(doc)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user['role'] != 'super_admin':
        query['company_id'] = current_user.get('company_id')
    
    clients = await db.clients.find(query, {"_id": 0}).to_list(1000)
    for c in clients:
        if isinstance(c.get('created_at'), str):
            c['created_at'] = datetime.fromisoformat(c['created_at'])
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if isinstance(client.get('created_at'), str):
        client['created_at'] = datetime.fromisoformat(client['created_at'])
    return client

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    allowed_fields = ['name', 'phone', 'email', 'status', 'assigned_to']
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    if update_fields:
        await db.clients.update_one({"id": client_id}, {"$set": update_fields})
    
    updated = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Client(**updated)

# ============= NOTES ROUTES =============

@api_router.post("/notes", response_model=Note, status_code=201)
async def create_note(note_data: NoteCreate, current_user: dict = Depends(get_current_user)):
    note = Note(
        **note_data.model_dump(),
        user_id=current_user['sub']
    )
    doc = note.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notes.insert_one(doc)
    return note

@api_router.get("/notes/{entity_type}/{entity_id}", response_model=List[Note])
async def get_notes(entity_type: str, entity_id: str, current_user: dict = Depends(get_current_user)):
    notes = await db.notes.find(
        {"entity_type": entity_type, "entity_id": entity_id},
        {"_id": 0}
    ).to_list(1000)
    for n in notes:
        if isinstance(n.get('created_at'), str):
            n['created_at'] = datetime.fromisoformat(n['created_at'])
    return notes

# ============= DEALS ROUTES =============

@api_router.post("/deals", response_model=Deal, status_code=201)
async def create_deal(deal_data: DealCreate, current_user: dict = Depends(get_current_user)):
    deal = Deal(
        **deal_data.model_dump(),
        company_id=current_user.get('company_id')
    )
    doc = deal.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('closing_date'):
        doc['closing_date'] = doc['closing_date'].isoformat()
    await db.deals.insert_one(doc)
    return deal

@api_router.get("/deals", response_model=List[Deal])
async def get_deals(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if current_user['role'] != 'super_admin':
        query['company_id'] = current_user.get('company_id')
    if status:
        query['status'] = status
    
    deals = await db.deals.find(query, {"_id": 0}).to_list(1000)
    for d in deals:
        if isinstance(d.get('created_at'), str):
            d['created_at'] = datetime.fromisoformat(d['created_at'])
        if isinstance(d.get('closing_date'), str):
            d['closing_date'] = datetime.fromisoformat(d['closing_date'])
    return deals

@api_router.get("/deals/{deal_id}", response_model=Deal)
async def get_deal(deal_id: str, current_user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    if isinstance(deal.get('created_at'), str):
        deal['created_at'] = datetime.fromisoformat(deal['created_at'])
    if isinstance(deal.get('closing_date'), str):
        deal['closing_date'] = datetime.fromisoformat(deal['closing_date'])
    return deal

@api_router.put("/deals/{deal_id}", response_model=Deal)
async def update_deal(deal_id: str, update_data: dict, current_user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id}, {"_id": 0})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    allowed_fields = ['status', 'commission_total', 'agent_commission', 'closing_date']
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    if update_fields:
        await db.deals.update_one({"id": deal_id}, {"$set": update_fields})
    
    updated = await db.deals.find_one({"id": deal_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('closing_date'), str):
        updated['closing_date'] = datetime.fromisoformat(updated['closing_date'])
    return Deal(**updated)

# ============= WALLET ROUTES =============

@api_router.get("/wallet")
async def get_wallet(current_user: dict = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"user_id": current_user['sub']}, {"_id": 0})
    if not wallet:
        # Create wallet if doesn't exist
        wallet = Wallet(user_id=current_user['sub'], balance=0.0)
        await db.wallets.insert_one(wallet.model_dump())
        wallet = wallet.model_dump()
    return wallet

@api_router.post("/wallet/topup")
async def topup_wallet(topup_data: WalletTopUp, current_user: dict = Depends(get_current_user)):
    if topup_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    wallet = await db.wallets.find_one({"user_id": current_user['sub']}, {"_id": 0})
    if not wallet:
        wallet = Wallet(user_id=current_user['sub'], balance=0.0)
        await db.wallets.insert_one(wallet.model_dump())
        wallet = wallet.model_dump()
    
    new_balance = wallet['balance'] + topup_data.amount
    await db.wallets.update_one({"user_id": current_user['sub']}, {"$set": {"balance": new_balance}})
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user['sub'],
        amount=topup_data.amount,
        type="credit",
        description="Wallet top-up"
    )
    trans_doc = transaction.model_dump()
    trans_doc['created_at'] = trans_doc['created_at'].isoformat()
    await db.transactions.insert_one(trans_doc)
    
    return {"message": "Top-up successful", "new_balance": new_balance}

@api_router.get("/wallet/transactions", response_model=List[Transaction])
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find(
        {"user_id": current_user['sub']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for t in transactions:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    return transactions

# ============= DASHBOARD ROUTES =============

@api_router.get("/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    company_id = current_user.get('company_id')
    
    # Today's date range
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get wallet
    wallet = await db.wallets.find_one({"user_id": user_id}, {"_id": 0})
    wallet_balance = wallet['balance'] if wallet else 0
    
    # Build query based on role
    company_query = {}
    if current_user['role'] != 'super_admin' and company_id:
        company_query = {'company_id': company_id}
    
    # Count leads
    total_leads = await db.leads.count_documents({**company_query, 'is_available': False})
    today_leads = await db.leads.count_documents({
        **company_query,
        'is_available': False,
        'created_at': {'$gte': today.isoformat()}
    })
    
    # Count active leads (not closed/lost)
    active_leads = await db.leads.count_documents({
        **company_query,
        'is_available': False,
        'status': {'$nin': ['closed', 'lost']}
    })
    
    # Count deals
    total_deals = await db.deals.count_documents(company_query)
    active_deals = await db.deals.count_documents({
        **company_query,
        'status': {'$nin': ['closed', 'cancelled']}
    })
    
    # Calculate earnings from closed deals
    closed_deals = await db.deals.find({
        **company_query,
        'status': 'closed'
    }, {"_id": 0}).to_list(1000)
    
    total_earnings = sum(d.get('agent_commission', 0) or 0 for d in closed_deals)
    
    # Available leads for purchase
    available_leads = await db.leads.count_documents({'is_available': True})
    
    # Clients count
    total_clients = await db.clients.count_documents(company_query)
    
    return {
        "today_leads": today_leads,
        "total_leads": total_leads,
        "active_leads": active_leads,
        "total_deals": total_deals,
        "active_deals": active_deals,
        "total_earnings": total_earnings,
        "wallet_balance": wallet_balance,
        "available_leads": available_leads,
        "total_clients": total_clients
    }

# ============= ADMIN ROUTES =============

@api_router.post("/admin/leads/bulk")
async def bulk_create_leads(leads: List[LeadCreate], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can bulk create leads")
    
    created = []
    for lead_data in leads:
        lead = Lead(**lead_data.model_dump(), is_available=True)
        doc = lead.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.leads.insert_one(doc)
        created.append(lead)
    
    return {"message": f"Created {len(created)} leads", "leads": created}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'super_admin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    
    total_companies = await db.companies.count_documents({})
    total_users = await db.users.count_documents({})
    total_leads = await db.leads.count_documents({})
    available_leads = await db.leads.count_documents({'is_available': True})
    sold_leads = await db.leads.count_documents({'is_available': False})
    total_deals = await db.deals.count_documents({})
    
    # Revenue from lead sales
    transactions = await db.transactions.find({'type': 'debit'}, {"_id": 0}).to_list(10000)
    total_revenue = sum(t.get('amount', 0) for t in transactions)
    
    return {
        "total_companies": total_companies,
        "total_users": total_users,
        "total_leads": total_leads,
        "available_leads": available_leads,
        "sold_leads": sold_leads,
        "total_deals": total_deals,
        "total_revenue": total_revenue
    }

# ============= MARKETPLACE ROUTES =============

@api_router.post("/properties", response_model=Property)
async def create_property(prop_data: PropertyCreate, current_user: dict = Depends(get_current_user)):
    prop = Property(
        **prop_data.model_dump(),
        broker_id=current_user['sub'],
        company_id=current_user.get('company_id')
    )
    doc = prop.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.properties.insert_one(doc)
    return prop

@api_router.get("/properties", response_model=List[Property])
async def get_properties(
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"status": "active"}
    
    if property_type and property_type != "all":
        query['property_type'] = property_type
    if min_price:
        query['price'] = {"$gte": min_price}
    if max_price:
        if 'price' in query:
            query['price']['$lte'] = max_price
        else:
            query['price'] = {"$lte": max_price}
    if location:
        query['location'] = {"$regex": location, "$options": "i"}
    
    properties = await db.properties.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for p in properties:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
    return properties

@api_router.get("/properties/{prop_id}", response_model=Property)
async def get_property(prop_id: str, current_user: dict = Depends(get_current_user)):
    prop = await db.properties.find_one({"id": prop_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if isinstance(prop.get('created_at'), str):
        prop['created_at'] = datetime.fromisoformat(prop['created_at'])
    return prop

@api_router.delete("/properties/{prop_id}")
async def delete_property(prop_id: str, current_user: dict = Depends(get_current_user)):
    prop = await db.properties.find_one({"id": prop_id}, {"_id": 0})
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    if prop.get('broker_id') != current_user['sub'] and current_user['role'] != 'super_admin':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.properties.delete_one({"id": prop_id})
    return {"message": "Property deleted"}

# ============= SUBSCRIPTION ROUTES =============

SUBSCRIPTION_PLANS = [
    {
        "id": "standard",
        "name": "Standard",
        "price": 550,
        "features": ["Access to marketplace", "Up to 10 leads per month", "Basic analytics", "Email support"],
        "leads_per_month": 10,
        "is_recommended": False
    },
    {
        "id": "pro",
        "name": "Pro",
        "price": 900,
        "features": ["Everything in Standard", "Unlimited leads", "Advanced analytics", "Priority support", "Featured listings"],
        "leads_per_month": -1,
        "is_recommended": True
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price": 1500,
        "features": ["Everything in Pro", "Team management", "Custom integrations", "Dedicated account manager", "White-label options"],
        "leads_per_month": -1,
        "is_recommended": False
    }
]

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    return SUBSCRIPTION_PLANS

@api_router.get("/subscriptions/my")
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    sub = await db.subscriptions.find_one(
        {"user_id": current_user['sub'], "status": "active"},
        {"_id": 0}
    )
    return sub

@api_router.post("/subscriptions/subscribe")
async def subscribe(plan_id: str, current_user: dict = Depends(get_current_user)):
    plan = next((p for p in SUBSCRIPTION_PLANS if p['id'] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Check wallet balance
    wallet = await db.wallets.find_one({"user_id": current_user['sub']}, {"_id": 0})
    if not wallet or wallet['balance'] < plan['price']:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Deduct from wallet
    new_balance = wallet['balance'] - plan['price']
    await db.wallets.update_one({"user_id": current_user['sub']}, {"$set": {"balance": new_balance}})
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user['sub'],
        amount=plan['price'],
        type="debit",
        description=f"Subscription: {plan['name']} plan"
    )
    trans_doc = transaction.model_dump()
    trans_doc['created_at'] = trans_doc['created_at'].isoformat()
    await db.transactions.insert_one(trans_doc)
    
    # Cancel existing subscription
    await db.subscriptions.update_many(
        {"user_id": current_user['sub'], "status": "active"},
        {"$set": {"status": "cancelled"}}
    )
    
    # Create new subscription
    sub = UserSubscription(
        user_id=current_user['sub'],
        plan_name=plan['name'],
        price=plan['price'],
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    sub_doc = sub.model_dump()
    sub_doc['starts_at'] = sub_doc['starts_at'].isoformat()
    sub_doc['expires_at'] = sub_doc['expires_at'].isoformat()
    await db.subscriptions.insert_one(sub_doc)
    
    return {"message": f"Subscribed to {plan['name']} plan", "new_balance": new_balance}

# ============= SEED DATA =============

@api_router.post("/seed/properties")
async def seed_properties(current_user: dict = Depends(get_current_user)):
    """Seed sample properties for marketplace"""
    sample_properties = [
        {
            "title": "Luxury Penthouse in Dubai Marina",
            "description": "Stunning penthouse with panoramic views of the marina and sea",
            "price": 15000000,
            "location": "Dubai Marina",
            "area": "Dubai Marina",
            "bedrooms": 4,
            "bathrooms": 5,
            "size_sqm": 511,
            "property_type": "penthouse",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "is_featured": True
        },
        {
            "title": "Palm Jumeirah Villa",
            "description": "Beachfront villa with private pool and garden",
            "price": 35000000,
            "location": "Palm Jumeirah",
            "area": "Palm Jumeirah",
            "bedrooms": 6,
            "bathrooms": 7,
            "size_sqm": 1115,
            "property_type": "villa",
            "image_url": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "is_featured": True
        },
        {
            "title": "Downtown Dubai Apartment",
            "description": "Modern apartment with Burj Khalifa views",
            "price": 4500000,
            "location": "Downtown Dubai",
            "area": "Downtown Dubai",
            "bedrooms": 2,
            "bathrooms": 3,
            "size_sqm": 167,
            "property_type": "apartment",
            "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "is_featured": True
        },
        {
            "title": "Townhouse in Arabian Ranches",
            "description": "Family-friendly townhouse with community amenities",
            "price": 3200000,
            "location": "Arabian Ranches",
            "area": "Arabian Ranches",
            "bedrooms": 3,
            "bathrooms": 4,
            "size_sqm": 260,
            "property_type": "townhouse",
            "image_url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            "is_featured": False
        },
        {
            "title": "Beachfront Apartment in JBR",
            "description": "Direct beach access with stunning sunset views",
            "price": 2800000,
            "location": "JBR",
            "area": "Jumeirah Beach Residence",
            "bedrooms": 2,
            "bathrooms": 2,
            "size_sqm": 130,
            "property_type": "apartment",
            "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "is_featured": False
        },
        {
            "title": "Abu Dhabi Corniche Penthouse",
            "description": "Luxurious penthouse overlooking the Corniche",
            "price": 8500000,
            "location": "Abu Dhabi Corniche",
            "area": "Abu Dhabi",
            "bedrooms": 3,
            "bathrooms": 4,
            "size_sqm": 325,
            "property_type": "penthouse",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "is_featured": True
        }
    ]
    
    created = 0
    for prop_data in sample_properties:
        existing = await db.properties.find_one({"title": prop_data['title']})
        if not existing:
            prop = Property(**prop_data)
            doc = prop.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.properties.insert_one(doc)
            created += 1
    
    return {"message": f"Created {created} sample properties"}

# ============= ROOT =============

@api_router.get("/")
async def root():
    return {"message": "Dubai Real Estate SaaS Platform API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
