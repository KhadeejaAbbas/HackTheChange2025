import { useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const formConfigs = [
  {
    key: 'registerDoctor',
    title: 'Register Doctor',
    description: 'Create a doctor account and add it to the Doctors group.',
    endpoint: '/auth/register/doctor',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'name', label: 'Full Name', required: true },
      { name: 'birthdate', label: 'Birthdate', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'text', required: true },
      { name: 'specialty', label: 'Specialty', required: false },
    ],
  },
  {
    key: 'registerPatient',
    title: 'Register Patient',
    description: 'Create a patient profile linked to the Patients group.',
    endpoint: '/auth/register/patient',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
      { name: 'name', label: 'Full Name', required: true },
      { name: 'birthdate', label: 'Birthdate', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'text', required: true },
      { name: 'patientId', label: 'Patient ID (optional)' },
      { name: 'age', label: 'Age (optional)', type: 'number', min: 0 },
      { name: 'condition', label: 'Condition (optional)' },
    ],
  },
  {
    key: 'login',
    title: 'Sign In',
    description: 'USER_PASSWORD_AUTH to retrieve Cognito tokens.',
    endpoint: '/auth/login',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
  {
    key: 'confirm',
    title: 'Confirm Sign Up',
    description: 'Verify the email code sent by Cognito.',
    endpoint: '/auth/confirm',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'code', label: 'Verification Code', required: true },
    ],
  },
  {
    key: 'resend',
    title: 'Resend Confirmation Code',
    description: 'Trigger another verification email.',
    endpoint: '/auth/resend-confirmation',
    fields: [
      { name: 'email', label: 'Email Address', type: 'email', required: true },
    ],
  },
];

function buildInitialState(fields) {
  return fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});
}

function sanitizePayload(values) {
  const payload = {};
  Object.entries(values).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      return;
    }

    if (key === 'age') {
      payload[key] = Number(value);
    } else {
      payload[key] = value;
    }
  });
  return payload;
}

function AuthForm({ config }) {
  const [values, setValues] = useState(() => buildInitialState(config.fields));
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [responseBody, setResponseBody] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'loading', message: 'Sending request...' });
    setResponseBody('');

    try {
      const res = await fetch(`${API_BASE_URL}${config.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizePayload(values)),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setStatus({ state: 'success', message: 'Success' });
      setResponseBody(JSON.stringify(data, null, 2));
    } catch (error) {
      setStatus({ state: 'error', message: error.message });
    }
  };

  const handleReset = () => {
    setValues(buildInitialState(config.fields));
    setStatus({ state: 'idle', message: '' });
    setResponseBody('');
  };

  return (
    <section className="card">
      <header>
        <h2>{config.title}</h2>
        <p>{config.description}</p>
      </header>
      <form onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <label key={field.name} className="field">
            <span>
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name]}
              onChange={handleChange}
              required={field.required}
              min={field.min}
            />
          </label>
        ))}
        <div className="actions">
          <button type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" className="secondary" onClick={handleReset}>
            Clear
          </button>
        </div>
      </form>
      {status.state !== 'idle' && (
        <div className={`status ${status.state}`}>
          <strong>{status.state.toUpperCase()}:</strong> {status.message}
          {responseBody && (
            <pre>
              {responseBody}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}

function App() {
  const sortedForms = useMemo(() => formConfigs, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>HackTheChange Auth Console</h1>
        <p>
          Target API: <code>{API_BASE_URL}</code>
        </p>
        <p className="hint">Use these forms to exercise Cognito + DynamoDB flows quickly.</p>
      </header>

      <main className="grid">
        {sortedForms.map((config) => (
          <AuthForm key={config.key} config={config} />
        ))}
      </main>
    </div>
  );
}

export default App;
