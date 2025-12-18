// Standardized chart configuration for consistent styling across all pages

export const chartColors = {
    primary: '#6366f1',    // Indigo
    secondary: '#8b5cf6',  // Purple
    success: '#10b981',    // Emerald
    warning: '#f59e0b',    // Amber
    error: '#ef4444',      // Red
    info: '#06b6d4',       // Cyan
    prelims: '#8b5cf6',    // Purple for Prelims
    mains: '#ef4444',      // Red for Mains
    palette: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']
};

export const chartGrid = {
    stroke: 'rgba(255,255,255,0.05)',
    strokeDasharray: '0',
    vertical: false
};

export const chartAxis = {
    stroke: '#4a5568',
    fontSize: 12,
    axisLine: false,
    tickLine: false
};

export const chartTooltipStyle = {
    contentStyle: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: '12px 16px'
    },
    labelStyle: {
        color: '#9ca3af',
        fontSize: '12px',
        marginBottom: '4px'
    },
    itemStyle: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 500
    },
    cursor: { fill: 'rgba(99, 102, 241, 0.1)' }
};

// Gradient definitions for area charts
export const createGradient = (id: string, color: string) => ({
    id,
    stops: [
        { offset: '0%', stopColor: color, stopOpacity: 0.4 },
        { offset: '100%', stopColor: color, stopOpacity: 0.02 }
    ]
});

// Common chart props
export const getAreaChartProps = (color: string, gradientId: string) => ({
    type: 'monotone' as const,
    stroke: color,
    strokeWidth: 2,
    fill: `url(#${gradientId})`,
    animationDuration: 1500,
    animationEasing: 'ease-out' as const
});

export const getLineChartProps = (color: string) => ({
    type: 'monotone' as const,
    stroke: color,
    strokeWidth: 3,
    dot: {
        fill: color,
        strokeWidth: 2,
        stroke: '#0d0d1a',
        r: 5
    },
    activeDot: {
        r: 7,
        fill: color,
        stroke: '#fff',
        strokeWidth: 2
    },
    animationDuration: 1500
});

// Responsive chart height
export const getChartHeight = (isMobile: boolean) => isMobile ? 200 : 320;

// Pie chart config
export const pieChartConfig = {
    innerRadius: '60%',
    outerRadius: '80%',
    paddingAngle: 3,
    animationDuration: 1500
};
