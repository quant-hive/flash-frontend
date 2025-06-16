# Flash Backend API Documentation

This document provides comprehensive guidance on integrating with the Flash backend API from a frontend application.

## Table of Contents

- [Flash Backend API Documentation](#flash-backend-api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Authentication](#authentication)
    - [Obtaining a Token](#obtaining-a-token)
    - [Using Authentication Tokens](#using-authentication-tokens)
    - [User Registration](#user-registration)
    - [User Authentication](#user-authentication)
    - [Session Management](#session-management)
      - [List Your Sessions](#list-your-sessions)
      - [Logout Current Session](#logout-current-session)
      - [Revoke Specific Session](#revoke-specific-session)
  - [Backtests](#backtests)
    - [Running a Backtest](#running-a-backtest)
    - [Getting Backtest Status](#getting-backtest-status)
    - [Getting Backtest Results](#getting-backtest-results)
    - [Getting Trade Reports](#getting-trade-reports)
    - [Getting Benchmark Returns](#getting-benchmark-returns)
    - [Downloading Backtest Reports](#downloading-backtest-reports)
    - [Debugging Backtests](#debugging-backtests)
    - [Getting User Backtests](#getting-user-backtests)
    - [Deleting Backtests](#deleting-backtests)
  - [Database Operations](#database-operations)
    - [Getting Database Info](#getting-database-info)
    - [Getting Available Tickers](#getting-available-tickers)
    - [Verifying Database](#verifying-database)
    - [Getting Benchmark Returns](#getting-benchmark-returns-1)
  - [User Management](#user-management)
    - [Getting Current User](#getting-current-user)
    - [Listing Users (Admin Only)](#listing-users-admin-only)
    - [Deleting Users (Admin Only)](#deleting-users-admin-only)
  - [Error Handling](#error-handling)
    - [Common Error Codes](#common-error-codes)
    - [Error Response Format](#error-response-format)
  - [Using the API with a Frontend Framework](#using-the-api-with-a-frontend-framework)
    - [Example with React and Axios](#example-with-react-and-axios)
    - [Example with Vue and Fetch](#example-with-vue-and-fetch)

## Authentication

### Obtaining a Token

To interact with protected endpoints, you must first obtain an authentication token.

**Endpoint:** `POST /api/auth/token`

**Request Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Request Body (Form Data):**
```
username: string
password: string
```

**Example Request:**
```javascript
const response = await fetch('/api/auth/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    'username': 'your_username',
    'password': 'your_password'
  })
});
```

**Response Schema:**
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Potential Errors:**
- `401 Unauthorized`: Incorrect username or password
- `422 Unprocessable Entity`: Invalid form data

### Using Authentication Tokens

Once you have obtained a token, include it in the `Authorization` header for all authenticated requests:

```javascript
const response = await fetch('/api/protected-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### User Registration

**Endpoint:** `POST /api/auth/register`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Example Request:**
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'new_user',
    email: 'user@example.com',
    password: 'secure_password'
  })
});
```

**Response Schema:**
```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "is_active": "boolean",
  "role": "string",
  "created_at": "datetime"
}
```

**Potential Errors:**
- `400 Bad Request`: Username or email already registered
- `422 Unprocessable Entity`: Invalid request data

### User Authentication

See [Obtaining a Token](#obtaining-a-token).

### Session Management

#### List Your Sessions

**Endpoint:** `GET /api/auth/my-sessions`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
[
  {
    "id": "integer",
    "created_at": "datetime",
    "expires_at": "datetime"
  }
]
```

#### Logout Current Session

**Endpoint:** `POST /api/auth/logout-me`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "Successfully logged out"
}
```

#### Revoke Specific Session

**Endpoint:** `DELETE /api/auth/my-session/{token_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "Session revoked successfully"
}
```

## Backtests

### Running a Backtest

**Endpoint:** `POST /api/backtest/run`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "prompt": "string",
  "tickers": ["string"],
  "initial_cash": "number",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "commission": "number"
}
```

**Example Request:**
```javascript
const response = await fetch('/api/backtest/run', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "AAPL Moving Average Strategy",
    prompt: "Create a strategy that buys AAPL when the 50-day moving average crosses above the 200-day moving average and sells when it crosses below.",
    tickers: ["AAPL"],
    initial_cash: 100000,
    start_date: "2020-01-01",
    end_date: "2023-01-01",
    commission: 0.12
  })
});
```

**Response Schema:**
```json
{
  "backtest_id": "string",
  "name": "string",
  "status": "string",
  "message": "string"
}
```

**Example Response:**
```json
{
  "backtest_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "AAPL Moving Average Strategy",
  "status": "pending",
  "message": "Backtest queued for execution"
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `422 Unprocessable Entity`: Invalid request data

### Getting Backtest Status

**Endpoint:** `GET /api/backtest/status/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "backtest_id": "string",
  "name": "string",
  "status": "string",
  "message": "string",
  "created_at": "datetime"
}
```

**Example Response:**
```json
{
  "backtest_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "AAPL Moving Average Strategy",
  "status": "completed",
  "message": "Backtest completed successfully",
  "created_at": "2023-05-15T14:30:25.123Z"
}
```

**Possible Status Values:**
- `pending`: Backtest is in the queue
- `running`: Backtest is currently executing
- `completed`: Backtest has completed successfully
- `failed`: Backtest encountered an error

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest
- `404 Not Found`: Backtest not found

### Getting Backtest Results

**Endpoint:** `GET /api/backtest/results/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "backtest_id": "string",
  "name": "string",
  "metrics": {
    "total_return": "number",
    "annual_return": "number",
    "volatility": "number",
    "sharpe": "number",
    "sortino": "number",
    "max_drawdown": "number",
    "win_rate": "number",
    "alpha": "number",
    "beta": "number",
    "additional_metrics": "..."
  },
  "insights": "string",
  "improvements": "string",
  "strategy_code": "string"
}
```

**Example Response:**
```json
{
  "backtest_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "AAPL Moving Average Strategy",
  "metrics": {
    "total_return": 32.54,
    "annual_return": 12.76,
    "volatility": 18.42,
    "sharpe": 0.68,
    "sortino": 0.91,
    "max_drawdown": -15.23,
    "win_rate": 58.65,
    "alpha": 5.21,
    "beta": 0.78,
    "trades": 37,
    "initial_value": 100000,
    "final_value": 132540
  },
  "insights": "The strategy performs well in trending markets...",
  "improvements": "Consider adding a volatility filter to reduce drawdowns...",
  "strategy_code": "def initialize(context):\n    context.asset = symbol('AAPL')\n..."
}
```

**Metrics Explanation:**
- `total_return`: Total percentage return over the entire period
- `annual_return`: Annualized percentage return
- `volatility`: Annualized standard deviation of returns
- `sharpe`: Sharpe ratio (risk-adjusted return)
- `sortino`: Sortino ratio (downside risk-adjusted return)
- `max_drawdown`: Maximum percentage loss from peak to trough
- `win_rate`: Percentage of winning trades
- `alpha`: Jensen's alpha, excess return of the strategy relative to the benchmark after adjusting for beta
- `beta`: Beta coefficient, measure of the strategy's volatility relative to the market benchmark
- `trades`: Total number of trades executed
- `initial_value`: Initial portfolio value
- `final_value`: Final portfolio value

**Potential Errors:**
- `400 Bad Request`: Backtest not completed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest
- `404 Not Found`: Backtest not found

### Getting Trade Reports

**Endpoint:** `GET /api/backtest/trades/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
[
  {
    "id": "integer",
    "ticker": "string",
    "entry_date": "datetime",
    "exit_date": "datetime",
    "trade_type": "string",
    "entry_price": "number",
    "exit_price": "number",
    "position_size": "number",
    "pnl": "number",
    "returns_percentage": "number"
  }
]
```

**Example Response:**
```json
[
  {
    "id": 1,
    "ticker": "AAPL",
    "entry_date": "2022-01-05T00:00:00",
    "exit_date": "2022-02-10T00:00:00",
    "trade_type": "LONG",
    "entry_price": 175.23,
    "exit_price": 168.88,
    "position_size": 50.0,
    "pnl": -317.50,
    "returns_percentage": -3.62
  }
]
```

**Potential Errors:**
- `400 Bad Request`: Backtest not completed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest
- `404 Not Found`: Backtest not found

### Getting Benchmark Returns

**Endpoint:** `GET /api/backtest/returns/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
[
  {
    "id": "integer",
    "date": "datetime",
    "strategy_return": "number",
    "benchmark_return": "number"
  }
]
```

**Example Response:**
```json
[
  {
    "id": 1,
    "date": "2022-01-05T00:00:00",
    "strategy_return": 0.0023,
    "benchmark_return": 0.0018
  }
]
```

**Potential Errors:**
- `400 Bad Request`: Backtest not completed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest
- `404 Not Found`: Backtest not found

### Downloading Backtest Reports

**Endpoint:** `GET /api/backtest/download/{backtest_id}?format=csv|html`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: (optional) `csv` or `html` (default: `csv`)

This endpoint returns a file download, not a JSON response.

**Example Frontend Implementation:**
```javascript
// To trigger a file download
function downloadBacktestResults(backtest_id, format = 'csv') {
  const url = `/api/backtest/download/${backtest_id}?format=${format}`;
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `backtest_results.${format}`);
  a.click();
}
```

**Potential Errors:**
- `400 Bad Request`: Backtest not completed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest
- `404 Not Found`: Backtest or report not found

### Debugging Backtests

**Endpoint:** `GET /api/backtest/debug/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

This endpoint returns an HTML page with detailed debugging information, not a JSON response.

**Example Frontend Implementation:**
```javascript
// Open in a new tab/window
function openBacktestDebug(backtest_id) {
  window.open(`/api/backtest/debug/${backtest_id}`, '_blank');
}
```

**Potential Errors:**
- Same as for [Getting Backtest Results](#getting-backtest-results)

### Getting User Backtests

**Endpoint:** `GET /api/backtest/user/backtests`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
[
  {
    "backtest_id": "string",
    "name": "string",
    "status": "string",
    "message": "string",
    "created_at": "datetime"
  }
]
```

**Example Response:**
```json
[
  {
    "backtest_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "AAPL Moving Average Strategy",
    "status": "completed",
    "message": "Backtest completed successfully",
    "created_at": "2023-05-15T14:30:25.123Z"
  },
  {
    "backtest_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "MSFT RSI Strategy",
    "status": "running",
    "message": "Running backtest...",
    "created_at": "2023-05-15T14:30:25.123Z"
  }
]
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required

### Deleting Backtests

**Endpoint:** `DELETE /api/backtest/{backtest_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "Backtest a1b2c3d4-e5f6-7890-abcd-ef1234567890 has been deleted"
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User doesn't own this backtest and is not an admin
- `404 Not Found`: Backtest not found

## Database Operations

### Getting Database Info

**Endpoint:** `GET /api/database/info`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "database_path": "string",
  "start_date": "string|null",
  "end_date": "string|null"
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Database error

### Getting Available Tickers

**Endpoint:** `GET /api/database/tickers`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "tickers": ["string"]
}
```

**Example Response:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOG", "AMZN", "META"]
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Database error

### Verifying Database

**Endpoint:** `GET /api/database/verify`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "status": "string",
  "message": "string"
}
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Database verified successfully"
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Database error

### Getting Benchmark Returns

**Endpoint:** `GET /api/database/benchmark-returns/{start_date}/{end_date}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `start_date`: Start date in YYYY-MM-DD format
- `end_date`: End date in YYYY-MM-DD format

**Response Schema:**
```json
{
  "returns": {
    "dates": ["string"],
    "values": ["number"]
  }
}
```

**Example Frontend Implementation:**
```javascript
async function getBenchmarkReturns(startDate, endDate) {
  const response = await fetch(`/api/database/benchmark-returns/${startDate}/${endDate}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.returns;
  } else {
    throw new Error(`Failed to get benchmark returns: ${response.statusText}`);
  }
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Database error

## User Management

### Getting Current User

**Endpoint:** `GET /api/auth/me`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "is_active": "boolean",
  "role": "string",
  "created_at": "datetime"
}
```

**Example Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "is_active": true,
  "role": "user",
  "created_at": "2023-01-01T12:00:00Z"
}
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required or invalid token

### Listing Users (Admin Only)

**Endpoint:** `GET /api/auth/users`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
[
  {
    "id": "integer",
    "username": "string",
    "email": "string",
    "is_active": "boolean",
    "role": "string",
    "created_at": "datetime"
  }
]
```

**Potential Errors:**
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an admin

### Deleting Users (Admin Only)

**Endpoint:** `DELETE /api/auth/users/{user_id}`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "User with ID 2 deleted successfully"
}
```

**Potential Errors:**
- `400 Bad Request`: Cannot delete the only admin
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: User is not an admin
- `404 Not Found`: User not found

## Error Handling

### Common Error Codes

- `400 Bad Request`: Invalid request parameters or data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: User doesn't have permission for the requested resource
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Invalid request data
- `500 Internal Server Error`: Server-side error

### Error Response Format

All error responses follow this format:

```json
{
  "detail": "string"
}
```

**Example Error Response:**
```json
{
  "detail": "Incorrect username or password"
}
```

**Frontend Error Handling Example:**
```javascript
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## Using the API with a Frontend Framework

### Example with React and Axios

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Create an axios instance with default headers
const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Login component
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/token', 
        new URLSearchParams({
          username,
          password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        }
      );
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input 
        type="text" 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="Username" 
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password" 
      />
      <button type="submit">Login</button>
    </form>
  );
}

// Backtest List component
function BacktestList() {
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBacktests = async () => {
      try {
        const response = await api.get('/backtest/user/backtests');
        setBacktests(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.detail || 'Failed to fetch backtests');
        setLoading(false);
      }
    };
    
    fetchBacktests();
  }, []);
  
  const deleteBacktest = async (id) => {
    try {
      await api.delete(`/backtest/${id}`);
      setBacktests(backtests.filter(bt => bt.backtest_id !== id));
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to delete backtest');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Your Backtests</h2>
      <ul>
        {backtests.map(backtest => (
          <li key={backtest.backtest_id}>
            {backtest.backtest_id} - {backtest.status}
            <button onClick={() => deleteBacktest(backtest.backtest_id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example with Vue and Fetch

```javascript
// auth.js
export const authService = {
  async login(username, password) {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.access_token);
    return data;
  },
  
  getToken() {
    return localStorage.getItem('token');
  },
  
  logout() {
    localStorage.removeItem('token');
  }
};

// api.js
export const apiService = {
  async request(url, options = {}) {
    const token = authService.getToken();
    
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
    
    const response = await fetch(`/api${url}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  get(url) {
    return this.request(url);
  },
  
  post(url, data) {
    return this.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  },
  
  delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }
};

// Example Vue component
const BacktestComponent = {
  data() {
    return {
      backtests: [],
      loading: true,
      error: null
    };
  },
  
  methods: {
    async fetchBacktests() {
      try {
        this.loading = true;
        this.backtests = await apiService.get('/backtest/user/backtests');
        this.loading = false;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
      }
    },
    
    async deleteBacktest(id) {
      try {
        await apiService.delete(`/backtest/${id}`);
        this.backtests = this.backtests.filter(bt => bt.backtest_id !== id);
      } catch (error) {
        alert(error.message);
      }
    }
  },
  
  mounted() {
    this.fetchBacktests();
  }
};
```

By following this documentation, your frontend application can seamlessly integrate with the Flash backend API for a complete trading strategy backtesting experience. 