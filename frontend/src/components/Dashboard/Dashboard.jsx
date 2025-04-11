import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Chip,
  Button,
  Paper
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import 'react-circular-progressbar/dist/styles.css';
import './Dashboard.css';
import { useAuth } from '../../context/AuthContext';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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
    wallet: { current_balance: 0, initial_balance: 0 }
  });

  // First useEffect for wallet and dashboard data
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const checkWalletAndFetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if wallet exists
        const walletResponse = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
          withCredentials: true
        });

        // If no wallet exists, redirect to wallet page
        if (!walletResponse.data?.success || !walletResponse.data?.data) {
          navigate('/wallet');
          return;
        }

        // If wallet exists, proceed with fetching dashboard data
        const response = await axios.get(`${API_BASE_URL}/api/dashboard`, {
          withCredentials: true
        });

        if (response.data.success) {
          const {
            wallet,
            spendingTrends,
            budget,
            savings,
            upcomingPayments
          } = response.data.data;

          // Update wallet balance from the wallet response
          const currentWalletBalance = parseFloat(walletResponse.data.data.current_balance);
          const initialWalletBalance = parseFloat(walletResponse.data.data.initial_balance);

          if (isNaN(currentWalletBalance) || isNaN(initialWalletBalance)) {
            throw new Error("Invalid wallet balance data");
          }

          setDashboardData(prevData => ({
            ...prevData,
            wallet: {
              current_balance: currentWalletBalance,
              initial_balance: initialWalletBalance
            },
            spendingTrends: spendingTrends?.map(trend => ({
              month: trend.month,
              expenses: parseFloat(trend.expenses || 0),
              income: parseFloat(trend.income || 0)
            })) || [],
            budget: {
              total: budget?.total || 0,
              spent: budget?.spent || 0,
              remaining: budget?.remaining || 0,
              progress: budget?.progress || 0,
              activeBudgetsCount: budget?.activeBudgetsCount || 0
            },
            savings: {
              target: savings?.target || 0,
              saved: savings?.saved || 0,
              progress: savings?.progress || 0
            },
            upcomingPayments: upcomingPayments || []
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
          return;
        }
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    checkWalletAndFetchData();

    // Set up periodic refresh (every 1 second for real-time updates)
    const refreshInterval = setInterval(checkWalletAndFetchData, 1000);

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

  // Add check for no wallet
  if (!dashboardData.wallet || (dashboardData.wallet.current_balance === 0 && dashboardData.wallet.initial_balance === 0)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="80vh"
        p={3}
      >
        <Card sx={{ maxWidth: 400, width: '100%', textAlign: 'center', p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome to Your Financial Dashboard!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To get started with tracking your finances, you'll need to set up your wallet first.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/wallet')}
            sx={{ mt: 2 }}
          >
            Set Up My Wallet
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
        p: { xs: 2, sm: 3, md: 4 },
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
    >
      <Box 
        sx={{ 
          maxWidth: '100%',
          mx: 'auto',
          mb: 4
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 500, 
            color: '#1a237e',
            position: 'relative',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontFamily: "'Poppins', sans-serif",
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #1a237e, #3949ab)',
              borderRadius: '2px'
            }
          }}
        >
          Financial Overview
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mt: 1,
            fontWeight: 400,
            letterSpacing: '0.5px',
            fontFamily: "'Roboto', sans-serif"
          }}
        >
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Wallet Balance Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '200px', 
              display: 'flex', 
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    color: '#1a237e',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '1.1rem',
                    fontFamily: "'Poppins', sans-serif"
                  }}
                >
                  Available Balance
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 400, 
                    color: '#1a237e',
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '0.5px',
                    fontFamily: "'Roboto', sans-serif"
                  }}
                >
                  {formatCurrency(dashboardData.wallet?.current_balance)}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 400,
                    letterSpacing: '0.5px',
                    fontFamily: "'Roboto', sans-serif"
                  }}
                >
                  Initial Balance
                </Typography>
                <Typography 
                  variant="h6" 
                  color="primary"
                  sx={{ 
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    fontFamily: "'Roboto', sans-serif"
                  }}
                >
                  {formatCurrency(dashboardData.wallet?.initial_balance)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '200px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/transaction')}
                    startIcon={<AddIcon />}
                    sx={{ height: '48px' }}
                  >
                    Add Transaction
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/budget')}
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{ height: '48px' }}
                  >
                    Manage Budget
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/savings')}
                    startIcon={<SavingsIcon />}
                    sx={{ height: '48px' }}
                  >
                    Savings Goals
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate('/debttrack')}
                    startIcon={<CreditCardIcon />}
                    sx={{ height: '48px' }}
                  >
                    Debt Tracker
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Spending Trends */}
        <Grid item xs={12} md={8}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '400px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Spending Trends
              </Typography>
              <Box sx={{ height: '350px', mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.spendingTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#4caf50"
                      name="Income"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f44336"
                      name="Expenses"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Progress */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '400px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Budget Progress
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <div style={{ width: 180, height: 180 }}>
                  <CircularProgressbar
                    value={calculateBudgetProgress(dashboardData.budget)}
                    text={`${calculateBudgetProgress(dashboardData.budget)}%`}
                    styles={buildStyles({
                      pathColor: calculateBudgetProgress(dashboardData.budget) > 90 ? '#f44336' : 
                               calculateBudgetProgress(dashboardData.budget) > 70 ? '#ff9800' : '#4caf50',
                      textColor: '#1a237e',
                      trailColor: '#e0e0e0',
                      textSize: '24px',
                    })}
                  />
                </div>
              </Box>
              <Box mt={4} textAlign="center">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Spent:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.budget?.spent)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Budget:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.budget?.total)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Remaining:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.budget?.remaining)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Savings Progress */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%', 
              minHeight: '400px',
              background: 'linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Savings Progress
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <div style={{ width: 180, height: 180 }}>
                  <CircularProgressbar
                    value={calculateSavingsProgress(dashboardData.savings)}
                    text={`${calculateSavingsProgress(dashboardData.savings)}%`}
                    styles={buildStyles({
                      pathColor: calculateSavingsProgress(dashboardData.savings) > 90 ? '#4caf50' : 
                               calculateSavingsProgress(dashboardData.savings) > 50 ? '#2196f3' : '#ff9800',
                      textColor: '#1a237e',
                      trailColor: '#e0e0e0',
                      textSize: '24px',
                    })}
                  />
                </div>
              </Box>
              <Box mt={4} textAlign="center">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Saved:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.savings?.saved)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body1">Target:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.savings?.target)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Remaining:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(dashboardData.savings?.target - dashboardData.savings?.saved)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Payments */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fce4ec 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderRadius: 3,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
              }
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '1.1rem',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Upcoming Payments
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#1a237e',
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.5px'
                      }}>Name</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#1a237e',
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.5px'
                      }}>Amount</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#1a237e',
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.5px'
                      }}>Due Date</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#1a237e',
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.5px'
                      }}>Type</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 500, 
                        color: '#1a237e',
                        fontFamily: "'Poppins', sans-serif",
                        letterSpacing: '0.5px'
                      }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.upcomingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography 
                            sx={{ 
                              fontWeight: 600,
                              color: payment.amount < 0 ? '#f44336' : '#4caf50'
                            }}
                          >
                            {formatCurrency(payment.amount)}
                          </Typography>
                        </TableCell>
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
                          <Typography variant="body1" color="text.secondary">
                            No upcoming payments
                          </Typography>
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
    </Box>
  );
};

export default Dashboard; 