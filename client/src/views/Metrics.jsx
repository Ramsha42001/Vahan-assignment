import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMetrics } from '../redux/features/metrics/metricSlice';
import { CircularProgress, Typography, Paper, Grid, Box, IconButton, Fade } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import Sidebar from '../components/sidebar';
import MenuIcon from '@mui/icons-material/Menu';
import { alpha } from '@mui/material/styles';

// Add theme colors constant at the top
const themeColors = {
  primary: {
    main: '#4F46E5',
    light: '#6366F1',
    dark: '#4338CA',
    gradient: 'linear-gradient(to right, #4F46E5, #9333EA)',
  },
  secondary: {
    main: '#9333EA',
    light: '#A855F7',
    dark: '#7E22CE',
  },
  background: {
    paper: alpha('#fff', 0.9),
    gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  },
};

const Metrics = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { metrics, loading, error } = useSelector((state) => state.metrics);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const handleCreateNewSession = () => {
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth/login');
    };

    useEffect(() => {
        dispatch(fetchMetrics());
    }, [dispatch]);

    // Prepare data for the latency over time chart ////
    const prepareLatencyData = (data) => {
        if (!data?.latency_over_time) return [];
        return data.latency_over_time.map(item => ({
            x: new Date(parseInt(item.timestamp)),
            y: parseFloat(item.value)
        }));
    };

    // Enhanced chart configurations
    const latencyTimeSeriesOptions = {
        chart: {
            type: 'area',
            height: 350,
            fontFamily: 'Inter, sans-serif',
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                }
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            dropShadow: {
                enabled: true,
                opacity: 0.1,
                blur: 3,
                left: 1,
                top: 1
            }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            lineCap: 'round'
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100],
                colorStops: [
                    { offset: 0, color: '#4F46E5', opacity: 0.8 },
                    { offset: 50, color: '#6366F1', opacity: 0.5 },
                    { offset: 100, color: '#818CF8', opacity: 0.2 }
                ]
            }
        },
        markers: {
            size: 4,
            colors: [themeColors.primary.main],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: {
                size: 7,
            }
        },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#666',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            },
            axisBorder: {
                show: true,
                color: '#f1f1f1'
            },
            axisTicks: {
                show: true,
                color: '#f1f1f1'
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toFixed(2) + 's',
                style: {
                    colors: '#666',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            }
        },
        tooltip: {
            theme: 'light',
            x: {
                format: 'dd MMM yyyy HH:mm:ss'
            },
            y: {
                formatter: (val) => val.toFixed(3) + ' seconds'
            },
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
            },
            marker: {
                show: true,
            }
        }
    };

    const gaugeOptions = {
        chart: {
            type: 'radialBar',
            height: 250,
            fontFamily: 'Inter, sans-serif',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                }
            },
            dropShadow: {
                enabled: true,
                opacity: 0.15,
                blur: 3,
                left: 0,
                top: 0
            }
        },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    margin: 0,
                    size: '70%',
                    background: 'transparent',
                    image: undefined,
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 0,
                        blur: 4,
                        opacity: 0.12
                    }
                },
                track: {
                    background: '#f8f8f8',
                    strokeWidth: '97%',
                    margin: 5,
                    dropShadow: {
                        enabled: true,
                        top: -3,
                        left: 0,
                        blur: 4,
                        opacity: 0.08
                    }
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '16px',
                        color: '#666',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        fontSize: '24px',
                        color: themeColors.primary.main,
                        offsetY: 0,
                        formatter: (val) => val.toFixed(1) + '%'
                    }
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                shadeIntensity: 0.5,
                gradientToColors: [themeColors.secondary.main],
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 1,
                stops: [0, 100]
            }
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['Progress'],
        colors: [themeColors.primary.main]
    };

    // Add new configuration for percentile comparison chart
    const percentileChartOptions = {
        chart: {
            type: 'bar',
            height: 250,
            fontFamily: 'Inter, sans-serif',
            toolbar: { show: false },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            },
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '60%',
                distributed: true,
                backgroundBarColors: ['#f8f9fa'],
                backgroundBarRadius: 8,
            }
        },
        colors: [
            themeColors.primary.main,
            themeColors.primary.light,
            themeColors.secondary.light
        ],
        dataLabels: {
            enabled: true,
            formatter: (val) => val.toFixed(3) + 's',
            style: {
                fontSize: '12px',
                colors: ['#fff']
            }
        },
        legend: { show: false },
        grid: {
            borderColor: '#f1f1f1',
            strokeDashArray: 5,
        },
        xaxis: {
            categories: ['P50', 'P95', 'P99'],
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            }
        },
        yaxis: {
            labels: {
                formatter: (val) => val.toFixed(2) + 's'
            }
        }
    };

    // Add new configuration for requests stats
    const requestStatsOptions = {
        chart: {
            type: 'donut',
            height: 250,
            fontFamily: 'Inter, sans-serif',
        },
        colors: [themeColors.primary.main, themeColors.secondary.main],
        labels: ['Successful', 'Failed'],
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Requests',
                            color: themeColors.primary.main,
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true
        },
        legend: {
            position: 'bottom'
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress sx={{ color: '#FF9933' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">Error: {error}</Typography>
            </Box>
        );
    }

    return (
        <Box className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
            <Box className="max-w-7xl mx-auto">
                {/* Header Section */}
                <Box className="flex justify-between items-center mb-8">
                    <Box>
                        <Typography 
                            variant="h4" 
                            className="text-gray-800 font-bold tracking-tight"
                            sx={{
                                background: 'linear-gradient(to right, #4F46E5, #9333EA)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Performance Metrics
                        </Typography>
                        <Typography variant="subtitle1" className="text-gray-500 mt-1">
                            Monitor and analyze system performance
                        </Typography>
                    </Box>
                </Box>

                <Fade in={true}>
                    <Grid container spacing={3}>
                        {/* Latency Over Time Chart */}
                        <Grid item xs={12}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Latency Over Time
                                </Typography>
                                <ReactApexChart
                                    options={{
                                        ...latencyTimeSeriesOptions,
                                        colors: [themeColors.primary.main],
                                    }}
                                    series={[{ name: 'Latency', data: prepareLatencyData(metrics) }]}
                                    type="area"
                                    height={350}
                                />
                            </Paper>
                        </Grid>

                        {/* Percentile Latencies */}
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Latency Percentiles
                                </Typography>
                                <ReactApexChart
                                    options={{
                                        ...percentileChartOptions,
                                        colors: [
                                            themeColors.primary.main,
                                            themeColors.primary.light,
                                            themeColors.secondary.light
                                        ],
                                    }}
                                    series={[{
                                        name: 'Latency',
                                        data: [
                                            metrics?.p50_latency || 0,
                                            metrics?.p95_latency || 0,
                                            metrics?.p99_latency || 0
                                        ]
                                    }]}
                                    type="bar"
                                    height={250}
                                />
                            </Paper>
                        </Grid>

                        {/* Request Statistics */}
                        <Grid item xs={12} md={6}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Request Statistics
                                </Typography>
                                <ReactApexChart
                                    options={{
                                        ...requestStatsOptions,
                                        colors: [themeColors.primary.main, themeColors.secondary.main],
                                    }}
                                    series={[
                                        metrics?.successful_requests || 0,
                                        (metrics?.total_requests || 0) - (metrics?.successful_requests || 0)
                                    ]}
                                    type="donut"
                                    height={250}
                                />
                            </Paper>
                        </Grid>

                        {/* Success Rate */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Success Rate
                                </Typography>
                                <ReactApexChart
                                    options={{
                                        ...gaugeOptions,
                                        colors: [themeColors.primary.main],
                                    }}
                                    series={[metrics?.success_rate * 100 || 0]}
                                    type="radialBar"
                                    height={250}
                                />
                            </Paper>
                        </Grid>

                        {/* Average Latency */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Average Latency
                                </Typography>
                                <Typography 
                                    variant="h3" 
                                    sx={{ 
                                        background: themeColors.primary.gradient,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        mt: 4
                                    }}
                                >
                                    {metrics?.avg_latency?.toFixed(3)}s
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Context Relevance */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'rgba(145, 158, 171, 0.12)',
                                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                                    background: alpha('#fff', 0.9),
                                    backdropFilter: 'blur(6px)'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#000000' }}>
                                    Context Relevance
                                </Typography>
                                <ReactApexChart
                                    options={{
                                        ...gaugeOptions,
                                        labels: ['Relevance'],
                                        colors: [themeColors.primary.main],
                                    }}
                                    series={[metrics?.avg_context_relevance * 100 || 0]}
                                    type="radialBar"
                                    height={250}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Fade>
            </Box>
        </Box>
    );
};

export default Metrics;
