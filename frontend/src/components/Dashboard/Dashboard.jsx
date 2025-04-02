import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Box, CircularProgress, Alert, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import 'react-circular-progressbar/dist/styles.css';
import './Dashboard.css';
import { useAuth } from '../../context/authContext';

const API_BASE_URL = 'http://localhost:8800';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    spendingTrends: [],
    budget: { total: 0, spent: 0, remaining: 0, progress: 0 },
    savings: { target: 0, saved: 0, progress: 0 },
    upcomingPayments: [],
    wallet: { balance: 0 }
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          withCredentials: true
        });

        console.log('Full Dashboard Response:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
          const {
            wallet,
            spendingTrends,
            budget,
            savings,
            upcomingPayments
          } = response.data.data;

          console.log('Raw Budget Data:', budget);
          console.log('Raw Savings Data:', savings);

          // Validate and transform data
          const validatedData = {
            wallet: {
              balance: parseFloat(wallet?.balance || 0)
            },
            spendingTrends: Array.isArray(spendingTrends) ? spendingTrends : [],
            budget: {
              total: parseFloat(budget?.total || 0),
              spent: parseFloat(budget?.spent || 0),
              remaining: parseFloat(budget?.remaining || 0),
              progress: parseFloat(budget?.progress || 0)
            },
            savings: {
              target: parseFloat(savings?.target || 0),
              saved: parseFloat(savings?.saved || 0),
              progress: parseFloat(savings?.progress || 0)
            },
            upcomingPayments: Array.isArray(upcomingPayments) ? upcomingPayments : []
          };

          console.log('Processed Budget Data:', validatedData.budget);
          console.log('Processed Savings Data:', validatedData.savings);
          console.log('Full Validated Data:', validatedData);
          
          setDashboardData(validatedData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
          return;
        }
        
        if (error.response) {
          setError(`Server error: ${error.response.data?.message || 'Unknown error'}`);
        } else if (error.request) {
          setError('Could not connect to the server. Please check your internet connection.');
        } else {
          setError(error.message || 'An error occurred while setting up the request.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchDashboardData();

    // Set up periodic refresh (every 5 minutes)
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [currentUser, navigate]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const calculateBudgetProgress = (budget) => {
    if (!budget.total || budget.total === 0) return 0;
    const progress = (budget.spent / budget.total) * 100;
    return Math.min(Math.round(progress), 100);
  };

  const calculateSavingsProgress = (savings) => {
    if (!savings.target || savings.target === 0) return 0;
    const progress = (savings.saved / savings.target) * 100;
    return Math.min(Math.round(progress), 100);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <div className="dashboard">
      <Typography variant="h4" gutterBottom>
        Financial Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Wallet Balance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wallet Balance
              </Typography>
              <Typography variant="h4" className="wallet-balance">
                {formatCurrency(dashboardData.wallet?.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Trends */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending Trends
              </Typography>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.spendingTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => {
                        const [year, month] = value.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => `$${value.toFixed(2)}`}
                      labelFormatter={(label) => {
                        const [year, month] = label.split('-');
                        return `${month}/${year.slice(2)}`;
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#4caf50"
                      name="Income"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f44336"
                      name="Expenses"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Progress */}
        <Grid item xs={12} md={4}>
          <Card className="progress-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Progress
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <div style={{ width: 150, height: 150 }}>
                  <CircularProgressbar
                    value={calculateBudgetProgress(dashboardData.budget)}
                    text={`${calculateBudgetProgress(dashboardData.budget)}%`}
                    styles={buildStyles({
                      pathColor: calculateBudgetProgress(dashboardData.budget) > 90 ? '#f44336' : 
                               calculateBudgetProgress(dashboardData.budget) > 70 ? '#ff9800' : '#4caf50',
                      textColor: '#000',
                      trailColor: '#e0e0e0',
                      textSize: '24px',
                      pathTransitionDuration: 0.5
                    })}
                  />
                </div>
              </Box>
              <Box mt={2} textAlign="center">
                <Typography variant="body2" className="budget-detail">
                  <span className="label">Spent:</span> {formatCurrency(dashboardData.budget?.spent)}
                </Typography>
                <Typography variant="body2" className="budget-detail">
                  <span className="label">Budget:</span> {formatCurrency(dashboardData.budget?.total)}
                </Typography>
                <Typography variant="body2" className="budget-detail">
                  <span className="label">Remaining:</span> {formatCurrency(dashboardData.budget?.remaining)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Savings Progress */}
        <Grid item xs={12} md={4}>
          <Card className="progress-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Savings Progress
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <div style={{ width: 150, height: 150 }}>
                  <CircularProgressbar
                    value={calculateSavingsProgress(dashboardData.savings)}
                    text={`${calculateSavingsProgress(dashboardData.savings)}%`}
                    styles={buildStyles({
                      pathColor: calculateSavingsProgress(dashboardData.savings) > 90 ? '#4caf50' : 
                               calculateSavingsProgress(dashboardData.savings) > 50 ? '#2196f3' : '#ff9800',
                      textColor: '#000',
                      trailColor: '#e0e0e0',
                      textSize: '24px',
                      pathTransitionDuration: 0.5
                    })}
                  />
                </div>
              </Box>
              <Box mt={2} textAlign="center">
                <Typography variant="body2" className="savings-detail">
                  <span className="label">Saved:</span> {formatCurrency(dashboardData.savings?.saved)}
                </Typography>
                <Typography variant="body2" className="savings-detail">
                  <span className="label">Target:</span> {formatCurrency(dashboardData.savings?.target)}
                </Typography>
                <Typography variant="body2" className="savings-detail">
                  <span className="label">Remaining:</span> {formatCurrency(dashboardData.savings?.target - dashboardData.savings?.saved)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Payments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Payments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.name || 'N/A'}</TableCell>
                        <TableCell>${formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          {payment.dueDate ? format(new Date(payment.dueDate), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{payment.type || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status}
                            color={payment.status === 'pending' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {dashboardData.upcomingPayments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No upcoming payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard; 