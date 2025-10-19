# 🧪 COMPLETE TESTING GUIDE - HEDERA HEALTH ID

## 📋 PREREQUISITES

### ✅ Initial Checks
- [x] Frontend running on http://localhost:3000
- [x] Backend running on http://localhost:3001
- [x] Neon database connected
- [x] Frontend and backend builds successful

## 🔧 TECHNICAL TESTS

### 1. 🌐 Backend Connectivity
```bash
# API health check
curl -X GET http://localhost:3001/health

# Expected response:
# {"status":"OK","message":"Hedera Health API is running","timestamp":"...","database":"Connected","version":"v1"}
```

### 2. 🏥 Available Test Data
```bash
# List doctors
curl -X GET http://localhost:3001/api/v1/medecins

# List patients
curl -X GET http://localhost:3001/api/v1/patients

# List hospitals
curl -X GET http://localhost:3001/api/v1/hopitaux
```

### 3. 🔐 Doctor Authentication Test
```bash
# Test with Dr. Jean ADJAHOUI (CHU-MEL)
curl -X POST http://localhost:3001/api/v1/auth/medecin \
  -H "Content-Type: application/json" \
  -d '{"email": "j.adjahoui@chu-mel.bj", "password": "password123", "hopitalCode": "chu-mel"}'

# Test with Dr. Pierre SOSSOU (CNHU-HKM)
curl -X POST http://localhost:3001/api/v1/auth/medecin \
  -H "Content-Type: application/json" \
  -d '{"email": "p.sossou@cnhu-hkm.bj", "password": "password123", "hopitalCode": "cnhu-hkm"}'

# Expected response: {"success":true,"data":{"token":"...","medecin":{...}}}
```

## 🎯 FUNCTIONAL TESTS

### 1. 🔐 Doctor Login Interface
**URL:** http://localhost:3000/medecin/login

#### ✅ Tests to perform:

**Option 1 - CHU-MEL:**
1. **Hospital selection:** CHU-MEL - Cotonou
2. **Valid email:** j.adjahoui@chu-mel.bj
3. **Password:** password123
4. **Domain validation:** Check that green icon appears
5. **Login:** Click "SE CONNECTER"

**Option 2 - CNHU-HKM:**
1. **Hospital selection:** CNHU-HKM - Cotonou
2. **Valid email:** p.sossou@cnhu-hkm.bj
3. **Password:** password123
4. **Domain validation:** Check that green icon appears
5. **Login:** Click "SE CONNECTER"

#### 🎯 Expected result:
- Redirect to `/medecin/dashboard`
- No infinite re-render errors
- Token stored in localStorage/sessionStorage
- Console displays debug logs

#### 🔍 All test doctors:
- **Dr. Jean ADJAHOUI (General Medicine):** j.adjahoui@chu-mel.bj - CHU-MEL
- **Dr. Marie KOSSOU (Cardiology):** m.kossou@chu-mel.bj - CHU-MEL
- **Dr. Pierre SOSSOU (Pediatrics):** p.sossou@cnhu-hkm.bj - CNHU-HKM

### 2. 📊 Doctor Dashboard
**URL:** http://localhost:3000/medecin/dashboard

#### ✅ Elements to verify:
1. **Header:** Doctor name displayed
2. **Daily KPIs:** 4 cards with statistics
3. **Patient search:** Functional search bar
4. **Quick actions:** 4 action buttons
5. **Daily schedule:** Appointment list
6. **Notifications:** Alerts section
7. **Personal statistics:** Charts/metrics

#### 🎯 Actions to test:
- Click "Nouvelle Consultation" → Redirect to form
- Click "Scanner QR" → Camera opens
- Search for a patient → Display results
- Responsive navigation

### 3. 👤 Patient Record
**URL:** http://localhost:3000/medecin/patient

#### ✅ Patient data to verify:
- **BJ20257830:** Test PATIENT (Main test patient)
- **BJ2025003:** Jean HOUNKPATIN
- **BJ2025002:** Marie DOSSOU
- **BJ2025001:** Adjoa KOSSOU

#### 🎯 Features to test:
1. **Patient search:** Enter patient ID
2. **Medical history:** View consultation history
3. **Vital signs:** Display current measurements
4. **Prescriptions:** List active medications
5. **QR Code:** Generate patient QR code

### 4. 🏥 Hospital Dashboard
**URL:** http://localhost:3000/hospital/dashboard

#### ✅ Login credentials:
- **Admin ID:** ADMIN001
- **Password:** password123

#### 🎯 Elements to verify:
1. **Statistics cards:** Total patients, doctors, consultations
2. **Doctors list:** All registered doctors
3. **Patients list:** All registered patients
4. **Recent consultations:** Latest medical activities
5. **Real-time data:** Auto-refresh functionality

## 🔬 INTEGRATION TESTS

### 1. 📱 QR Code Scanning
```bash
# Test QR code generation for patient BJ20257830
curl -X GET http://localhost:3001/api/v1/patients/BJ20257830/qr
```

### 2. 🔄 Real-time Data Sync
```bash
# Create new consultation and verify dashboard update
curl -X POST http://localhost:3001/api/v1/consultations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientId": "BJ20257830",
    "medecinId": "MED001",
    "motifConsultation": "Test consultation",
    "diagnostic": "Test diagnosis"
  }'
```

### 3. 🔐 Authentication Flow
1. **Login** → Token generation
2. **API calls** → Token validation
3. **Token refresh** → Automatic renewal
4. **Logout** → Token invalidation

## 🚨 ERROR SCENARIOS

### 1. ❌ Invalid Login
- Wrong email format
- Incorrect password
- Non-existent hospital code
- Network connectivity issues

### 2. ❌ API Failures
- Database connection lost
- Invalid patient ID
- Missing authentication token
- Server timeout

### 3. ❌ UI Edge Cases
- Empty search results
- Camera permission denied
- Offline mode behavior
- Mobile responsive issues

## ✅ SUCCESS CRITERIA

### 🎯 All tests must pass:
- [x] Backend API responds correctly
- [x] Doctor authentication works
- [x] Dashboard displays real data
- [x] Patient records are accessible
- [x] QR code scanning functions
- [x] Hospital dashboard shows statistics
- [x] Real-time updates work
- [x] Error handling is graceful
- [x] Mobile responsive design
- [x] Performance is acceptable

## 🏆 FINAL VALIDATION

### Production Readiness Checklist:
- [x] All APIs functional
- [x] Authentication secure
- [x] Data integrity maintained
- [x] UI/UX polished
- [x] Error handling complete
- [x] Performance optimized
- [x] Documentation complete
- [x] Deployment successful

---

**🎉 If all tests pass, the application is ready for production deployment!**
