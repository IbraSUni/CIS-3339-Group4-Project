// Database initialization (task D1).
//
//   npm run db:init           create or update everything below; deletes nothing
//   npm run db:init -- --reset  first delete this organization's users, clients,
//                               events and services, then seed again
//
// Creates, idempotently (running it twice creates no duplicates):
//   - the organization whose _id is ORG_ID
//   - the viewer and editor accounts from SEED_* variables (bcrypt-hashed)
//   - 15+ sample services, clients and events, with event registrations
//   - the indexes the API relies on
// Reads backend/.env. Exits with a nonzero code on any configuration or
// database problem so it can be used in scripts.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const RESET = process.argv.includes('--reset');
const SALT_ROUNDS = 10;

// ---------- 1. configuration check ----------
function readConfig() {
  const problems = [];
  const env = process.env;
  if (!env.MONGO_URL) problems.push('MONGO_URL is missing');
  if (!env.ORG_ID) problems.push('ORG_ID is missing');
  else if (!mongoose.Types.ObjectId.isValid(env.ORG_ID) || String(env.ORG_ID).length !== 24) {
    problems.push(`ORG_ID "${env.ORG_ID}" is not a 24-character MongoDB ObjectId`);
  }
  const accounts = [
    { role: 'viewer', username: env.SEED_VIEWER_USERNAME, password: env.SEED_VIEWER_PASSWORD, prefix: 'SEED_VIEWER' },
    { role: 'editor', username: env.SEED_EDITOR_USERNAME, password: env.SEED_EDITOR_PASSWORD, prefix: 'SEED_EDITOR' }
  ];
  for (const a of accounts) {
    if (!a.username) problems.push(`${a.prefix}_USERNAME is missing`);
    if (!a.password) problems.push(`${a.prefix}_PASSWORD is missing`);
  }
  if (accounts[0].username && accounts[0].username === accounts[1].username) {
    problems.push('SEED_VIEWER_USERNAME and SEED_EDITOR_USERNAME must be different');
  }
  if (problems.length) {
    console.error('db:init cannot run. Fix backend/.env:');
    problems.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
  }
  return { mongoUrl: env.MONGO_URL, orgId: new mongoose.Types.ObjectId(env.ORG_ID), accounts };
}

// ---------- 2. sample data ----------
const SERVICES = [
  ['Blood Pressure Screening', 'Free blood pressure checks with a community health worker.'],
  ['Diabetes Education', 'Small-group class on managing blood sugar, diet and medication.'],
  ['Flu Shots', 'Seasonal flu vaccinations for adults and children.'],
  ['Food Pantry', 'Groceries and fresh produce for families in need.'],
  ['Health Insurance Help', 'Help applying for Medicaid, CHIP or Marketplace coverage.'],
  ['Mental Health Referral', 'Screening and referral to local counseling services.'],
  ['Nutrition Class', 'Cooking demonstrations and healthy-eating tips.'],
  ['Prenatal Support', 'Check-ins and resources for expecting parents.'],
  ['Senior Wellness Check', 'Wellness visits and fall-risk screening for older adults.'],
  ['Smoking Cessation', 'Coaching and resources to quit tobacco.'],
  ['Vision Screening', 'Basic eye exams and referrals for glasses.'],
  ['Dental Screening', 'Dental checks and referrals to low-cost clinics.'],
  ['Housing Assistance', 'Connections to rental assistance and shelters.'],
  ['Job Readiness', 'Resume help and job-search workshops.'],
  ['Legacy Outreach Program', 'Retired program kept for historical events.', 'Inactive']
];

const CLIENTS = [
  ['Ana', 'Lopez', '7135550110', '77003'], ['Marcus', 'Bell', '7135550111', '77004'],
  ['Thuy', 'Nguyen', '7135550112', '77023'], ['Rahul', 'Patel', '7135550113', '77002'],
  ['Elena', 'Garcia', '7135550114', '77004'], ['Tobi', 'Okafor', '7135550115', '77011'],
  ['Grace', 'Kim', '7135550116', '77003'], ['Hector', 'Diaz', '7135550117', '77023'],
  ['Imani', 'Brooks', '7135550118', '77021'], ['Jamal', 'Brown', '7135550119', '77004'],
  ['Keiko', 'Ito', '7135550120', '77002'], ['Luis', 'Reyes', '7135550121', '77011'],
  ['Maya', 'Khan', '7135550122', '77003'], ['Nora', 'Moore', '7135550123', '77021'],
  ['Omar', 'Ali', '7135550124', '77023'], ['Priya', 'Shah', '7135550125', '77004'],
  ['Quinn', 'Young', '7135550126', '77002'], ['Rosa', 'Vega', '7135550127', '77011']
];

const EVENT_NAMES = [
  'Back-to-School Health Fair', 'Diabetes Prevention Workshop', 'Fall Flu Clinic', 'Community Food Drive',
  'Senior Wellness Morning', 'Family Nutrition Night', 'Insurance Enrollment Day', 'Mental Health Awareness Walk',
  'Vision and Dental Day', 'Prenatal Support Circle', 'Smoke-Free Living Session', 'Housing Resource Fair',
  'Job Readiness Workshop', 'Winter Coat and Health Drive', 'Heart Health Saturday', 'New Year Wellness Kickoff'
];

// ---------- 3. seeding ----------
async function main() {
  const config = readConfig();
  const { clients, orgs, events, users, services } = require('../models/models');

  console.log(`Connecting to ${config.mongoUrl.replace(/\/\/[^@]*@/, '//<credentials>@')} ...`);
  await mongoose.connect(config.mongoUrl, { serverSelectionTimeoutMS: 8000 });
  const org = config.orgId;
  const counts = { created: {}, existing: {} };
  const tally = (kind, wasCreated) => {
    const bucket = wasCreated ? counts.created : counts.existing;
    bucket[kind] = (bucket[kind] || 0) + 1;
  };

  if (RESET) {
    console.log('--reset: deleting this organization\'s users, clients, events and services');
    await Promise.all([
      users.deleteMany({ org }),
      clients.deleteMany({ orgs: org }),
      events.deleteMany({ org }),
      services.deleteMany({ org })
    ]);
  }

  // Organization
  const existingOrg = await orgs.findById(org);
  if (!existingOrg) await orgs.create({ _id: org, name: process.env.ORG_NAME || 'Community Center' });
  tally('organization', !existingOrg);

  // Accounts: create, or bring an existing account's role/password up to date.
  for (const account of config.accounts) {
    const found = await users.findOne({ username: account.username, org });
    if (!found) {
      await users.create({
        _id: new mongoose.Types.ObjectId(),
        username: account.username,
        password: await bcrypt.hash(account.password, SALT_ROUNDS),
        role: account.role,
        org
      });
      tally('users', true);
    } else {
      const update = {};
      if (found.role !== account.role) update.role = account.role;
      if (!(await bcrypt.compare(account.password, found.password))) {
        update.password = await bcrypt.hash(account.password, SALT_ROUNDS);
      }
      if (Object.keys(update).length) await users.updateOne({ _id: found._id }, { $set: update });
      tally('users', false);
    }
  }

  // Services (matched by name within the organization)
  const serviceDocs = [];
  for (const [name, description, status = 'Active'] of SERVICES) {
    let doc = await services.findOne({ name, org });
    tally('services', !doc);
    if (!doc) doc = await services.create({ name, description, status, org });
    serviceDocs.push(doc);
  }

  // Clients (matched by primary phone number within the organization)
  const clientDocs = [];
  for (const [firstName, lastName, phone, zip] of CLIENTS) {
    let doc = await clients.findOne({ 'phoneNumber.primary': phone, orgs: org });
    tally('clients', !doc);
    if (!doc) {
      doc = await clients.create({
        firstName,
        lastName,
        email: `${firstName}.${lastName}@example.org`.toLowerCase(),
        phoneNumber: { primary: phone },
        address: { line1: `${1200 + clientDocs.length * 17} Leeland St`, city: 'Houston', county: 'Harris', zip },
        orgs: [org]
      });
    }
    clientDocs.push(doc);
  }

  // Events (matched by name within the organization). Dates run from about
  // seven weeks ago to five weeks ahead, so the dashboard has data and the
  // create-event "not before today" rule can be demonstrated.
  const DAY = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < EVENT_NAMES.length; i++) {
    const name = EVENT_NAMES[i];
    let doc = await events.findOne({ name, org });
    tally('events', !doc);
    if (!doc) {
      const isPast = i < 10;
      doc = await events.create({
        org,
        name,
        description: `${name} hosted by community health workers.`,
        date: new Date(today.getTime() + (i - 10) * 5 * DAY),
        services: [serviceDocs[i % 14]._id, serviceDocs[(i + 3) % 14]._id],
        address: { line1: `${400 + i * 10} Main St`, city: 'Houston', county: 'Harris', zip: CLIENTS[i % CLIENTS.length][3] },
        // past events get a few attendees; upcoming ones start empty
        attendees: isPast ? clientDocs.slice(0, (i % 5) + 1).map((c) => c._id) : []
      });
    }
  }
  // Guarantee at least one registration even if the events already existed.
  await events.updateOne({ name: EVENT_NAMES[0], org }, { $addToSet: { attendees: clientDocs[0]._id } });

  // Indexes the API relies on
  await users.collection.createIndex({ username: 1, org: 1 }, { unique: true, name: 'username_org_unique' });
  await clients.collection.createIndex({ orgs: 1, lastName: 1, firstName: 1 }, { name: 'org_name' });
  await events.collection.createIndex({ org: 1, date: -1 }, { name: 'org_date' });
  await events.collection.createIndex({ attendees: 1 }, { name: 'attendees' });
  await services.collection.createIndex({ org: 1, name: 1 }, { name: 'org_name' });

  // Summary
  const totals = {
    users: await users.countDocuments({ org }),
    clients: await clients.countDocuments({ orgs: org }),
    services: await services.countDocuments({ org }),
    events: await events.countDocuments({ org }),
    registrations: (await events.find({ org }, { attendees: 1 }).lean()).reduce((n, e) => n + e.attendees.length, 0)
  };
  console.log('\ndb:init finished' + (RESET ? ' (after --reset)' : ''));
  console.log(`  organization  ${org} (${existingOrg ? 'already existed' : 'created'})`);
  for (const kind of ['users', 'services', 'clients', 'events']) {
    console.log(`  ${kind.padEnd(13)} ${totals[kind]} total (${counts.created[kind] || 0} created, ${counts.existing[kind] || 0} already there)`);
  }
  console.log(`  registrations ${totals.registrations}`);
  console.log('\nLog in with:');
  for (const a of config.accounts) console.log(`  ${a.role.padEnd(7)} ${a.username} / ${a.password}`);
}

main()
  .then(() => mongoose.disconnect())
  .catch(async (err) => {
    console.error(`\ndb:init failed: ${err.message}`);
    if (/ECONNREFUSED|Server selection timed out|getaddrinfo/i.test(err.message)) {
      console.error('Check that MongoDB is running and that MONGO_URL in backend/.env is correct.');
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
