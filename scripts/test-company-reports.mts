/**
 * Real-estate marketing work-talk → owner inbox smoke test.
 */
const BASE = process.env.AUTH_BASE || 'http://127.0.0.1:3001';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function json(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function main() {
  const stamp = Date.now().toString(36);
  const ownerId = `owner_${stamp}`;
  const empId = `emp_${stamp}`;
  const password = 'secret123';

  const ownerSignup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId: ownerId, password, displayName: 'Company Owner' }),
  });
  assert(ownerSignup.res.status === 201, 'owner signup');
  const ownerToken = ownerSignup.body.token as string;

  const empSignup = await json('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ userId: empId, password, displayName: 'Field Exec' }),
  });
  assert(empSignup.res.status === 201, 'employee signup');
  const empToken = empSignup.body.token as string;

  const saveOrg = await json('/api/v1/company/org', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${ownerToken}` },
    body: JSON.stringify({
      companyName: 'Skyline RE Marketing',
      industry: 'real_estate_marketing',
      tagline: 'Field talk to owner',
      ownerUserId: ownerId,
      ownerDisplayName: 'Company Owner',
      ownerPhone: '+919999999999',
      reportRecipients: [
        { userId: 'sales_head', displayName: 'Sales Head', title: 'Sales Head' },
      ],
      workHours: {
        enabled: true,
        days: [0, 1, 2, 3, 4, 5, 6],
        startTime: '00:00',
        endTime: '23:59',
        timezone: 'Asia/Kolkata',
      },
      allowAfterHoursCapture: true,
      notifyOwnerOnEveryTalk: true,
    }),
  });
  assert(saveOrg.res.ok, `save org ${saveOrg.res.status} ${saveOrg.body.error}`);
  assert(saveOrg.body.org.ownerUserId === ownerId, 'owner set');

  const talkText =
    'Client ne Palm Residency 2BHK ke liye Monday 11 baje site visit confirm kiya. Token 50k discuss hua.';
  const submit = await json('/api/v1/company/work-talk', {
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      text: talkText,
      leadOrSite: 'Palm Residency',
      locationLabel: 'Andheri',
      talkType: 'client_call',
    }),
  });
  assert(submit.res.status === 201, `submit talk ${submit.body.error}`);
  assert(submit.body.report?.deliveredTo?.length >= 1, 'delivered to someone');
  assert(
    submit.body.report.deliveredTo.some((d: any) => d.userId === ownerId),
    'delivered to owner',
  );
  console.log('work-talk delivered:', submit.body.report.id);

  const inbox = await json('/api/v1/company/work-talk', {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert(inbox.res.ok, 'owner inbox');
  assert(inbox.body.isOwner === true, 'viewer is owner');
  assert(
    (inbox.body.reports || []).some((r: any) => r.text.includes('Palm Residency')),
    'owner sees talk text',
  );
  console.log('owner inbox count', inbox.body.count);

  const empInbox = await json('/api/v1/company/work-talk', {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  assert(empInbox.res.ok, 'emp inbox');
  assert(
    (empInbox.body.reports || []).every((r: any) => r.employeeUserId === empId),
    'employee only sees own unless report desk',
  );

  console.log('ALL real-estate owner-report smoke tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
