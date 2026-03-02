#!/usr/bin/env python3

import requests
import json
from datetime import datetime
import sys

class DubaiRealEstateTester:
    def __init__(self, base_url="https://real-estate-saas-5.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_entities = {
            'users': [],
            'companies': [],
            'leads': [],
            'clients': [],
            'deals': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:500]}")

            try:
                response_data = response.json() if response.text else {}
            except:
                response_data = {}
                
            return success, response_data, response.status_code

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            return False, {}, None
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}, None

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_user_registration(self, email_suffix=None):
        """Test user registration"""
        if not email_suffix:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            email_suffix = timestamp
        
        user_data = {
            "name": f"Test Agent {email_suffix}",
            "email": f"test_agent_{email_suffix}@realestate.ae",
            "password": "TestPass123!",
            "phone": "+971501234567",
            "role": "agent",
            "rera_id": f"BRN-{email_suffix}"
        }
        
        success, response, status = self.run_test(
            "User Registration", "POST", "auth/register", 201, user_data
        )
        
        if success:
            self.token = response.get('access_token')
            self.user_data = response.get('user')
            self.created_entities['users'].append(response.get('user', {}).get('id'))
            print(f"   Registered user: {user_data['email']}")
            print(f"   User ID: {self.user_data.get('id') if self.user_data else 'N/A'}")
            print(f"   Token received: {'Yes' if self.token else 'No'}")
        
        return success, response, status

    def test_user_login(self, email, password):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response, status = self.run_test(
            "User Login", "POST", "auth/login", 200, login_data
        )
        
        if success:
            self.token = response.get('access_token')
            self.user_data = response.get('user')
            print(f"   Logged in as: {email}")
        
        return success, response, status

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_dashboard(self):
        """Test dashboard endpoint"""
        return self.run_test("Dashboard", "GET", "dashboard", 200)

    def test_wallet_operations(self):
        """Test wallet functionality"""
        print("\n📧 Testing Wallet Operations...")
        
        # Get wallet
        success, wallet, status = self.run_test("Get Wallet", "GET", "wallet", 200)
        if not success:
            return False
            
        initial_balance = wallet.get('balance', 0)
        print(f"   Initial balance: {initial_balance} AED")
        
        # Test top-up
        topup_amount = 1000.0
        topup_data = {"amount": topup_amount}
        success, response, status = self.run_test("Wallet Top-up", "POST", "wallet/topup", 200, topup_data)
        if not success:
            return False
            
        new_balance = response.get('new_balance')
        print(f"   New balance after top-up: {new_balance} AED")
        
        # Get transactions
        success, transactions, status = self.run_test("Get Transactions", "GET", "wallet/transactions", 200)
        return success

    def test_leads_operations(self):
        """Test leads functionality"""
        print("\n📋 Testing Leads Operations...")
        
        # Get available leads
        success, leads, status = self.run_test("Get Available Leads", "GET", "leads?available_only=true", 200)
        if not success:
            return False
            
        print(f"   Found {len(leads)} available leads")
        
        # Get all leads
        success, all_leads, status = self.run_test("Get All Leads", "GET", "leads", 200)
        if not success:
            return False
            
        print(f"   Total leads: {len(all_leads)}")
        
        # If there are available leads, try to buy one
        if leads and len(leads) > 0:
            lead_to_buy = leads[0]
            lead_id = lead_to_buy.get('id')
            lead_price = lead_to_buy.get('price', 0)
            
            print(f"   Attempting to buy lead: {lead_to_buy.get('name')} for {lead_price} AED")
            
            success, response, status = self.run_test(
                f"Buy Lead {lead_id}", "POST", f"leads/{lead_id}/buy", 200
            )
            
            if success:
                print(f"   Lead purchased successfully!")
                print(f"   New wallet balance: {response.get('new_balance')} AED")
        
        return True

    def test_clients_operations(self):
        """Test clients functionality"""
        print("\n👥 Testing Clients Operations...")
        
        # Create a client
        client_data = {
            "name": "Test Client Dubai",
            "phone": "+971509876543",
            "email": "testclient@dubai.ae"
        }
        
        success, client, status = self.run_test("Create Client", "POST", "clients", 201, client_data)
        if not success:
            return False
            
        client_id = client.get('id')
        self.created_entities['clients'].append(client_id)
        print(f"   Created client: {client.get('name')} (ID: {client_id})")
        
        # Get all clients
        success, clients, status = self.run_test("Get Clients", "GET", "clients", 200)
        if not success:
            return False
            
        print(f"   Total clients: {len(clients)}")
        
        # Get specific client
        success, client_detail, status = self.run_test(f"Get Client {client_id}", "GET", f"clients/{client_id}", 200)
        if not success:
            return False
            
        # Add a note to the client
        note_data = {
            "entity_type": "client",
            "entity_id": client_id,
            "text": "Initial contact - very interested in Palm Jumeirah properties"
        }
        
        success, note, status = self.run_test("Add Client Note", "POST", "notes", 201, note_data)
        if success:
            print(f"   Added note to client")
        
        # Get notes for client
        success, notes, status = self.run_test(f"Get Client Notes", "GET", f"notes/client/{client_id}", 200)
        if success:
            print(f"   Retrieved {len(notes)} notes for client")
        
        return True

    def test_deals_operations(self):
        """Test deals functionality"""
        print("\n💼 Testing Deals Operations...")
        
        # First get clients to use in deal
        success, clients, status = self.run_test("Get Clients for Deal", "GET", "clients", 200)
        if not success or not clients:
            print("   No clients found for creating deals")
            return True
            
        client_id = clients[0].get('id')
        
        # Create a deal
        deal_data = {
            "client_id": client_id,
            "property_name": "Luxury Penthouse - Burj Khalifa View",
            "deal_value": 2500000.0,
            "commission_total": 50000.0,
            "agent_commission": 25000.0
        }
        
        success, deal, status = self.run_test("Create Deal", "POST", "deals", 201, deal_data)
        if not success:
            return False
            
        deal_id = deal.get('id')
        self.created_entities['deals'].append(deal_id)
        print(f"   Created deal: {deal.get('property_name')} (ID: {deal_id})")
        print(f"   Deal value: ${deal.get('deal_value'):,.2f}")
        
        # Get all deals
        success, deals, status = self.run_test("Get Deals", "GET", "deals", 200)
        if not success:
            return False
            
        print(f"   Total deals: {len(deals)}")
        
        # Update deal status
        update_data = {"status": "offer"}
        success, updated_deal, status = self.run_test(f"Update Deal Status", "PUT", f"deals/{deal_id}", 200, update_data)
        if success:
            print(f"   Updated deal status to: {updated_deal.get('status')}")
        
        return True

    def test_super_admin_operations(self):
        """Test super admin operations (if user is super admin)"""
        if not self.user_data or self.user_data.get('role') != 'super_admin':
            print("\n⚠️  Skipping super admin tests - user is not super admin")
            return True
            
        print("\n🏢 Testing Super Admin Operations...")
        
        # Create a company
        company_data = {
            "name": "Test Real Estate Agency",
            "email": "agency@testrealestate.ae",
            "phone": "+971445678901",
            "license_number": "ORN-12345"
        }
        
        success, company, status = self.run_test("Create Company", "POST", "companies", 201, company_data)
        if not success:
            return False
            
        company_id = company.get('id')
        self.created_entities['companies'].append(company_id)
        print(f"   Created company: {company.get('name')} (ID: {company_id})")
        
        # Get all companies
        success, companies, status = self.run_test("Get Companies", "GET", "companies", 200)
        if success:
            print(f"   Total companies: {len(companies)}")
        
        # Create a lead
        lead_data = {
            "name": "Premium Lead - Russian Investor",
            "phone": "+971505555555",
            "email": "investor@russian.ru",
            "nationality": "Russian",
            "budget_min": 1000000,
            "budget_max": 5000000,
            "property_type": "villa",
            "area": "Palm Jumeirah",
            "source": "website",
            "price": 2500.0
        }
        
        success, lead, status = self.run_test("Create Lead", "POST", "leads", 201, lead_data)
        if success:
            lead_id = lead.get('id')
            self.created_entities['leads'].append(lead_id)
            print(f"   Created lead: {lead.get('name')} (ID: {lead_id})")
            print(f"   Lead price: {lead.get('price')} AED")
        
        # Get admin stats
        success, stats, status = self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        if success:
            print(f"   Platform stats retrieved:")
            print(f"     - Companies: {stats.get('total_companies')}")
            print(f"     - Users: {stats.get('total_users')}")
            print(f"     - Leads: {stats.get('total_leads')}")
            print(f"     - Revenue: {stats.get('total_revenue')} AED")
        
        return True

    def test_marketplace_operations(self):
        """Test marketplace and properties functionality (Phase 1 expansion)"""
        print("\n🏢 Testing Marketplace Operations...")
        
        # Seed properties first
        success, response, status = self.run_test("Seed Properties", "POST", "seed/properties", 200)
        if success:
            print(f"   Seeded properties: {response.get('message', 'Success')}")
        
        # Get all properties
        success, properties, status = self.run_test("Get Properties", "GET", "properties", 200)
        if not success:
            return False
        
        print(f"   Found {len(properties)} properties")
        
        # Test property filtering
        success, apartments, status = self.run_test("Filter Apartments", "GET", "properties?property_type=apartment", 200)
        if success:
            print(f"   Found {len(apartments)} apartments")
        
        # Test price filtering
        success, expensive, status = self.run_test("Filter Expensive Properties", "GET", "properties?min_price=5000000", 200)
        if success:
            print(f"   Found {len(expensive)} properties above 5M AED")
        
        # Get a specific property if any exist
        if properties and len(properties) > 0:
            prop_id = properties[0].get('id')
            success, property_detail, status = self.run_test(f"Get Property {prop_id}", "GET", f"properties/{prop_id}", 200)
            if success:
                images_count = len(property_detail.get('images', []))
                print(f"   Property has {images_count} images in gallery")
        
        # Create a new property
        property_data = {
            "title": "Test Luxury Apartment - API Created",
            "description": "Beautiful test property with sea views",
            "price": 1500000,
            "location": "Dubai Marina",
            "bedrooms": 2,
            "bathrooms": 2,
            "size_sqm": 120,
            "property_type": "apartment",
            "images": [
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
            ],
            "amenities": ["Pool", "Gym", "Parking"],
            "is_featured": False
        }
        
        success, new_property, status = self.run_test("Create Property", "POST", "properties", 200, property_data)
        if success:
            print(f"   Created property: {new_property.get('title')}")
        
        return True

    def test_calculators_operations(self):
        """Test financial calculators functionality (Phase 1 expansion)"""
        print("\n🧮 Testing Calculators Operations...")
        
        # Test mortgage calculator
        mortgage_data = {
            "property_price": 2000000,
            "down_payment_percent": 25,
            "loan_term_years": 20,
            "interest_rate": 4.0
        }
        
        success, mortgage_result, status = self.run_test("Mortgage Calculator", "POST", "calculators/mortgage", 200, mortgage_data)
        if success:
            monthly_payment = mortgage_result.get('monthly_payment')
            total_interest = mortgage_result.get('total_interest')
            print(f"   Mortgage: {monthly_payment:,.0f} AED/month, Total interest: {total_interest:,.0f} AED")
        
        # Test ROI calculator
        roi_data = {
            "property_price": 2000000,
            "annual_rent": 150000,
            "service_charges": 20000,
            "maintenance": 10000
        }
        
        success, roi_result, status = self.run_test("ROI Calculator", "POST", "calculators/roi", 200, roi_data)
        if success:
            gross_yield = roi_result.get('gross_yield')
            net_yield = roi_result.get('net_yield')
            print(f"   ROI: Gross yield {gross_yield}%, Net yield {net_yield}%")
        
        # Test expenses calculator
        expenses_data = {
            "property_price": 2000000,
            "property_type": "apartment"
        }
        
        success, expenses_result, status = self.run_test("Expenses Calculator", "POST", "calculators/expenses", 200, expenses_data)
        if success:
            total_costs = expenses_result.get('total_one_time_costs')
            percentage = expenses_result.get('percentage_of_price')
            print(f"   Expenses: {total_costs:,.0f} AED ({percentage}% of price)")
        
        return True

    def test_ai_assistant_operations(self):
        """Test AI assistant chat functionality (Phase 1 expansion)"""
        print("\n🤖 Testing AI Assistant Operations...")
        
        # Test initial chat
        chat_data = {
            "message": "What areas in Dubai are best for investment?",
            "session_id": None
        }
        
        success, chat_response, status = self.run_test("AI Chat - First Message", "POST", "chat", 200, chat_data)
        if not success:
            print("   ⚠️  AI Chat might not be working - check EMERGENT_LLM_KEY")
            return False
        
        session_id = chat_response.get('session_id')
        ai_response = chat_response.get('response', '')
        print(f"   AI Response length: {len(ai_response)} characters")
        print(f"   Session ID: {session_id}")
        
        # Test follow-up message in same session
        followup_data = {
            "message": "Tell me more about Dubai Marina properties",
            "session_id": session_id
        }
        
        success, followup_response, status = self.run_test("AI Chat - Follow-up", "POST", "chat", 200, followup_data)
        if success:
            print(f"   Follow-up response length: {len(followup_response.get('response', ''))}")
        
        # Test getting chat history
        success, history, status = self.run_test(f"Get Chat History", "GET", f"chat/history/{session_id}", 200)
        if success:
            print(f"   Chat history: {len(history)} messages")
        
        # Test getting all sessions
        success, sessions, status = self.run_test("Get Chat Sessions", "GET", "chat/sessions", 200)
        if success:
            print(f"   Total chat sessions: {len(sessions)}")
        
        return True

    def test_super_admin_registration(self):
        """Test super admin registration"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        super_admin_data = {
            "name": f"Super Admin {timestamp}",
            "email": f"superadmin_{timestamp}@platform.ae",
            "password": "SuperAdmin123!",
            "phone": "+971501111111",
            "role": "super_admin",
            "rera_id": f"SA-{timestamp}"
        }
        
        success, response, status = self.run_test(
            "Super Admin Registration", "POST", "auth/register", 201, super_admin_data
        )
        
        if success:
            # Store old token and user data
            old_token = self.token
            old_user = self.user_data
            
            # Set new super admin credentials
            self.token = response.get('access_token')
            self.user_data = response.get('user')
            self.created_entities['users'].append(response.get('user', {}).get('id'))
            
            print(f"   Registered super admin: {super_admin_data['email']}")
            
            # Test super admin operations
            admin_success = self.test_super_admin_operations()
            
            # Restore original user credentials
            self.token = old_token
            self.user_data = old_user
            
            return admin_success
        
        return success

def main():
    print("🚀 Starting Dubai Real Estate SaaS Platform API Tests")
    print("=" * 60)
    
    tester = DubaiRealEstateTester()
    
    # Test API availability
    success, _, _ = tester.test_root_endpoint()
    if not success:
        print("❌ API not accessible. Stopping tests.")
        return 1
    
    # Test user registration and authentication
    success, _, _ = tester.test_user_registration()
    if not success:
        print("❌ User registration failed. Stopping tests.")
        return 1
    
    # Store registration credentials for login test
    reg_email = f"test_agent_{datetime.now().strftime('%Y%m%d_%H%M%S')}@realestate.ae"
    reg_password = "TestPass123!"
    
    # Test login with different credentials
    success, _, _ = tester.test_user_login(reg_email, reg_password)
    if not success:
        # Registration worked but login failed, continue with existing token
        print("⚠️  Login test failed but continuing with registration token")
    
    # Test authenticated endpoints
    success, _, _ = tester.test_get_current_user()
    if not success:
        print("❌ Authentication failed. Cannot continue.")
        return 1
    
    # Test dashboard
    tester.test_dashboard()
    
    # Test wallet operations
    tester.test_wallet_operations()
    
    # Test leads operations
    tester.test_leads_operations()
    
    # Test clients operations
    tester.test_clients_operations()
    
    # Test deals operations
    tester.test_deals_operations()
    
    # Test Phase 1 expansion features
    tester.test_marketplace_operations()
    tester.test_calculators_operations()
    tester.test_ai_assistant_operations()
    
    # Test super admin functionality
    tester.test_super_admin_registration()
    
    # Print final results
    print("\n" + "=" * 60)
    print("🎯 Test Results Summary")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.created_entities['users']:
        print(f"\nCreated users: {len(tester.created_entities['users'])}")
    if tester.created_entities['companies']:
        print(f"Created companies: {len(tester.created_entities['companies'])}")
    if tester.created_entities['leads']:
        print(f"Created leads: {len(tester.created_entities['leads'])}")
    if tester.created_entities['clients']:
        print(f"Created clients: {len(tester.created_entities['clients'])}")
    if tester.created_entities['deals']:
        print(f"Created deals: {len(tester.created_entities['deals'])}")
    
    success_threshold = 0.80  # 80% success rate
    if (tester.tests_passed / tester.tests_run) >= success_threshold:
        print(f"\n✅ Overall: PASSED (≥{success_threshold*100:.0f}% success rate)")
        return 0
    else:
        print(f"\n❌ Overall: FAILED (<{success_threshold*100:.0f}% success rate)")
        return 1

if __name__ == "__main__":
    sys.exit(main())