async function testAuthFlow() {
  console.log('Testing E-Report Auth & Token Flow...');

  // 1. Test Resident Registration & immediate token issuance
  const testEmail = `test.resident.${Date.now()}@bensican.gov.ph`;
  const regRes = await fetch('http://localhost:5001/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Resident Maria',
      email: testEmail,
      password: 'ResidentPassword2026!',
      houseNumber: '124',
      street: 'Mabini St',
      barangay: 'Bensican',
      residencyLength: '15 years',
      agreePrivacyPolicy: true
    })
  });

  const regData = await regRes.json();
  console.log('1. Registration Response:', {
    status: regRes.status,
    hasToken: Boolean(regData.token),
    hasUser: Boolean(regData.user),
    userRole: regData.user?.role,
    userStatus: regData.user?.status
  });

  if (!regData.token || regData.user?.role !== 'resident') {
    throw new Error('Registration did not issue active token and user object');
  }

  // 2. Test Admin Login and 2FA
  const adminRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bensican.gov.ph',
      password: 'BensicanAdmin2026!'
    })
  });
  const adminData = await adminRes.json();
  console.log('2. Admin Login Initial Challenge:', {
    status: adminRes.status,
    requires2FA: adminData.requires2FA,
    hasTempToken: Boolean(adminData.tempToken)
  });

  const verifyRes = await fetch('http://localhost:5001/api/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tempToken: adminData.tempToken,
      code: '123456'
    })
  });
  const verifyData = await verifyRes.json();
  console.log('3. Admin 2FA Verify:', {
    status: verifyRes.status,
    hasToken: Boolean(verifyData.token),
    role: verifyData.user?.role
  });

  if (!verifyData.token || verifyData.user?.role !== 'admin') {
    throw new Error('Admin 2FA login failed');
  }

  // 4. Test Super Admin Login and 2FA
  const saRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'superadmin@bensican.gov.ph',
      password: 'BensicanAdmin2026!'
    })
  });
  const saData = await saRes.json();
  const saVerifyRes = await fetch('http://localhost:5001/api/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tempToken: saData.tempToken,
      code: '123456'
    })
  });
  const saVerifyData = await saVerifyRes.json();
  console.log('4. Super Admin 2FA Verify:', {
    status: saVerifyRes.status,
    hasToken: Boolean(saVerifyData.token),
    role: saVerifyData.user?.role
  });

  if (!saVerifyData.token || saVerifyData.user?.role !== 'super_admin') {
    throw new Error('Super Admin 2FA login failed');
  }

  console.log('All Auth Flow Tests Passed 100%!');
}

testAuthFlow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

