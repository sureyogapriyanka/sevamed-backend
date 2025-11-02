// Test script to verify patient profile functionality
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sevaonline';

async function testPatientProfile() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create a test user with all patient fields
    const testUser = new User({
      username: 'testpatient_profile',
      password: 'testpassword123',
      role: 'patient',
      name: 'Test Patient Profile',
      email: 'testpatient@example.com',
      age: 35,
      gender: 'Male',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      bloodGroup: 'O+',
      profileImage: null
    });

    await testUser.save();
    console.log('Test user created:', testUser._id);

    // Create a test patient record
    const testPatient = new Patient({
      userId: testUser._id,
      medicalHistory: 'No significant medical history',
      allergies: ['Penicillin', 'Pollen'],
      medications: 'Vitamin D supplement',
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+1987654321'
      },
      bloodType: 'O+',
      height: 175,
      weight: 70,
      bmi: '22.9',
      lastVisit: new Date()
    });

    await testPatient.save();
    console.log('Test patient record created:', testPatient._id);

    // Retrieve and display the patient with populated user data
    const populatedPatient = await Patient.findById(testPatient._id)
      .populate('userId', 'name username email age gender phone address bloodGroup');

    console.log('Patient data with user info:');
    console.log('Name:', populatedPatient.userId.name);
    console.log('Email:', populatedPatient.userId.email);
    console.log('Age:', populatedPatient.userId.age);
    console.log('Gender:', populatedPatient.userId.gender);
    console.log('Phone:', populatedPatient.userId.phone);
    console.log('Address:', populatedPatient.userId.address);
    console.log('Blood Group:', populatedPatient.userId.bloodGroup);
    console.log('Medical History:', populatedPatient.medicalHistory);
    console.log('Allergies:', populatedPatient.allergies);
    console.log('Height:', populatedPatient.height);
    console.log('Weight:', populatedPatient.weight);
    console.log('BMI:', populatedPatient.bmi);

    // Clean up test data
    await User.findByIdAndDelete(testUser._id);
    await Patient.findByIdAndDelete(testPatient._id);
    console.log('Test data cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testPatientProfile();