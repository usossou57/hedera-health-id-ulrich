# 🏥 Hedera Health ID - API Documentation

## Endpoints

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Patient details
- `PUT /api/patients/:id` - Update patient

### Doctors
- `GET /api/medecins` - List doctors
- `POST /api/medecins/login` - Doctor login

### Consultations
- `GET /api/consultations` - List consultations
- `POST /api/consultations` - New consultation

### Hedera
- `GET /api/hedera/status` - Blockchain status
- `POST /api/hedera/create-patient` - Patient on blockchain
