// Copy this content and save as: scripts/generate-data.js

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const dataDir = path.join(__dirname, '..', 'data');
const publicDataDir = path.join(__dirname, '..', 'public', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Sample patients data
const patients = [
  {
    "id": "PT000001",
    "name": "Thandolwenkosi Magagula",
    "firstName": "Thandolwenkosi",
    "lastName": "Magagula",
    "idNumber": "218728448",
    "dob": "1990-01-15",
    "gender": "male",
    "race": "African",
    "cellphoneNumber": "0821234567",
    "address": {
      "streetAddress": "123 Main Street",
      "suburb": "Delmas",
      "city": "Delmas",
      "province": "Mpumalanga",
      "postalCode": "2210"
    },
    "chronicDiseases": ["Hypertension", "Diabetes Type 2"],
    "lastVisit": "2023-10-20"
  },
  {
    "id": "PT000002", 
    "name": "Nomsa Ndlovu",
    "firstName": "Nomsa",
    "lastName": "Ndlovu",
    "idNumber": "987654321",
    "dob": "1985-05-22",
    "gender": "female",
    "race": "African", 
    "cellphoneNumber": "0837654321",
    "address": {
      "streetAddress": "456 Church Street",
      "suburb": "Soweto",
      "city": "Johannesburg",
      "province": "Gauteng",
      "postalCode": "1804"
    },
    "chronicDiseases": ["Asthma"],
    "lastVisit": "2024-01-01"
  },
  {
    "id": "PT000003",
    "name": "Sipho Mthembu", 
    "firstName": "Sipho",
    "lastName": "Mthembu",
    "idNumber": "123456789",
    "dob": "1978-11-30",
    "gender": "male",
    "race": "African",
    "cellphoneNumber": "0729876543",
    "address": {
      "streetAddress": "789 Market Street",
      "suburb": "Sandton",
      "city": "Johannesburg",
      "province": "Gauteng",
      "postalCode": "2196"
    },
    "chronicDiseases": [],
    "lastVisit": "2023-12-15"
  }
];

// Generate more patients
const firstNames = ['Precious', 'Thabo', 'Lerato', 'Kagiso', 'Palesa', 'Tshepo', 'Dineo', 'Karabo', 'Mandla', 'Zanele', 'Bongi', 'Sello', 'Neo', 'Kgotso'];
const lastNames = ['Dlamini', 'Khumalo', 'Nkosi', 'Molefe', 'Mokoena', 'Mahlangu', 'Sithole', 'Mabasa', 'Radebe', 'Zwane'];
const provinces = ['Gauteng', 'Mpumalanga', 'Western Cape', 'KwaZulu-Natal', 'Free State', 'Limpopo'];

for (let i = 4; i <= 100; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const province = provinces[Math.floor(Math.random() * provinces.length)];
  
  patients.push({
    "id": `PT${String(i).padStart(6, '0')}`,
    "name": `${firstName} ${lastName}`,
    "firstName": firstName,
    "lastName": lastName,
    "idNumber": `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    "dob": `${1950 + Math.floor(Math.random() * 50)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    "gender": Math.random() > 0.5 ? "male" : "female",
    "race": "African",
    "cellphoneNumber": `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 90000000) + 10000000}`,
    "address": {
      "streetAddress": `${Math.floor(Math.random() * 999) + 1} ${['Main', 'Church', 'Market', 'High'][Math.floor(Math.random() * 4)]} Street`,
      "suburb": "Central",
      "city": province === 'Gauteng' ? 'Johannesburg' : province === 'Western Cape' ? 'Cape Town' : 'Durban',
      "province": province,
      "postalCode": `${Math.floor(Math.random() * 9000) + 1000}`
    },
    "chronicDiseases": Math.random() > 0.7 ? [['Diabetes Type 2', 'Hypertension', 'Asthma', 'Heart Disease'][Math.floor(Math.random() * 4)]] : [],
    "lastVisit": `2024-${String(Math.floor(Math.random() * 9) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
  });
}

// Triage data
const triage = [
  {
    "id": "T00000001",
    "patientId": "PT000001",
    "visitId": "V00000001", 
    "symptoms": "chest pain",
    "vitals": "BP: 140/90, Temp: 37.2C, HR: 85",
    "painLevel": 7,
    "urgencyLevel": "urgent",
    "riskLevel": "HIGH",
    "priority": 2,
    "estimatedWaitTime": "5-15 minutes",
    "department": "Emergency",
    "status": "waiting",
    "checkedInAt": "09:30",
    "assessmentTime": "2024-09-02T09:30:00Z"
  },
  {
    "id": "T00000002",
    "patientId": "PT000002",
    "visitId": "V00000002",
    "symptoms": "fever and cough",
    "vitals": "BP: 120/80, Temp: 38.5C, HR: 78", 
    "painLevel": 4,
    "urgencyLevel": "standard",
    "riskLevel": "MEDIUM",
    "priority": 3,
    "estimatedWaitTime": "30-60 minutes",
    "department": "General Medicine",
    "status": "waiting",
    "checkedInAt": "09:45",
    "assessmentTime": "2024-09-02T09:45:00Z"
  },
  {
    "id": "T00000003",
    "patientId": "PT000003", 
    "visitId": "V00000003",
    "symptoms": "headache",
    "vitals": "BP: 110/70, Temp: 36.8C, HR: 72",
    "painLevel": 3,
    "urgencyLevel": "standard", 
    "riskLevel": "LOW",
    "priority": 4,
    "estimatedWaitTime": "60-120 minutes",
    "department": "General Medicine",
    "status": "waiting",
    "checkedInAt": "10:00",
    "assessmentTime": "2024-09-02T10:00:00Z"
  }
];

// Generate more triage records
const symptoms = ['headache', 'nausea', 'back pain', 'dizziness', 'cough', 'joint pain', 'abdominal pain', 'fatigue'];
const urgencyLevels = ['standard', 'semi-urgent', 'urgent', 'non-urgent'];
const departments = ['General Medicine', 'Emergency', 'Pediatrics', 'Surgery'];

for (let i = 4; i <= 50; i++) {
  const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
  const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
  
  let riskLevel, priority, estimatedWaitTime, department;
  
  if (urgency === 'urgent' || symptom.includes('chest') || symptom.includes('breathing')) {
    riskLevel = 'HIGH';
    priority = 2;
    estimatedWaitTime = '5-15 minutes';
    department = 'Emergency';
  } else if (urgency === 'semi-urgent' || symptom === 'abdominal pain') {
    riskLevel = 'MEDIUM';
    priority = 3;
    estimatedWaitTime = '30-60 minutes'; 
    department = 'General Medicine';
  } else {
    riskLevel = 'LOW';
    priority = 4;
    estimatedWaitTime = '60-120 minutes';
    department = 'General Medicine';
  }
  
  triage.push({
    "id": `T${String(i).padStart(8, '0')}`,
    "patientId": `PT${String(Math.floor(Math.random() * 100) + 1).padStart(6, '0')}`,
    "visitId": `V${String(i).padStart(8, '0')}`,
    "symptoms": symptom,
    "vitals": `BP: ${110 + Math.floor(Math.random() * 40)}/${70 + Math.floor(Math.random() * 30)}, Temp: ${(35.5 + Math.random() * 3).toFixed(1)}C, HR: ${60 + Math.floor(Math.random() * 40)}`,
    "painLevel": Math.floor(Math.random() * 11),
    "urgencyLevel": urgency,
    "riskLevel": riskLevel,
    "priority": priority,
    "estimatedWaitTime": estimatedWaitTime,
    "department": department,
    "status": ['waiting', 'in-progress', 'completed'][Math.floor(Math.random() * 3)],
    "checkedInAt": `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    "assessmentTime": new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
  });
}

// Users data
const users = [
  {
    "id": "U001",
    "idNumber": "218728448",
    "role": "Admin",
    "province": "Mpumalanga", 
    "facilityId": "MP001",
    "facilityName": "Delmas District Hospital",
    "isAdmin": false
  },
  {
    "id": "U002",
    "idNumber": "admin001",
    "role": "Admin",
    "province": "All",
    "facilityId": "ADMIN",
    "facilityName": "System Administrator",
    "isAdmin": true
  },
  {
    "id": "U003",
    "idNumber": "987654321", 
    "role": "Nurse",
    "province": "Gauteng",
    "facilityId": "GT001",
    "facilityName": "Chris Hani Baragwanath Hospital",
    "isAdmin": false
  },
  {
    "id": "U004",
    "idNumber": "123456789",
    "role": "Doctor", 
    "province": "Western Cape",
    "facilityId": "WC001",
    "facilityName": "Groote Schuur Hospital",
    "isAdmin": false
  }
];

// Write files to both data and public/data directories
try {
  // Write to data directory
  fs.writeFileSync(path.join(dataDir, 'patients.json'), JSON.stringify(patients, null, 2));
  fs.writeFileSync(path.join(dataDir, 'triage.json'), JSON.stringify(triage, null, 2));
  fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(users, null, 2));
  
  // Write to public/data directory (for web access)
  fs.writeFileSync(path.join(publicDataDir, 'patients.json'), JSON.stringify(patients, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'triage.json'), JSON.stringify(triage, null, 2));
  fs.writeFileSync(path.join(publicDataDir, 'users.json'), JSON.stringify(users, null, 2));
  
  console.log('✅ Successfully generated data files:');
  console.log(`📁 data/patients.json - ${patients.length} patients`);
  console.log(`📁 data/triage.json - ${triage.length} triage records`);
  console.log(`📁 data/users.json - ${users.length} users`);
  console.log(`📁 public/data/ - Files copied for web access`);
  console.log('\n🎯 Data generation complete! You can now run: npm run dev');
  
} catch (error) {
  console.error('❌ Error generating data:', error);
}