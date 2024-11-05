/* eslint-disable react/prop-types */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from "react"
import { Bar, Pie } from 'react-chartjs-2'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

function Graficas({ cars, carTypes }) {
console.log("🚀 ~ Graficas ~ cars:", cars)

    const [selectedYear, setSelectedYear] = useState('all');

    // autos por tipo
    const carsByType = carTypes.map(tipo => cars.filter(car => car.tipo === tipo).length)

    // autos por año de fabricación
    const carsByYear = Object.entries(cars.reduce((acc, car) => {
        acc[car.anio] = (acc[car.anio] || 0) + 1
        return acc
    }, {})).sort((a, b) => a[0] - b[0])

    // Autos por marca
    const carsByBrand = Object.entries(cars.reduce((acc, car) => {
        acc[car.marca] = (acc[car.marca] || 0) + 1
        return acc
    }, {})).sort((a, b) => b[1] - a[1])

    // Autos por fecha de guardado
    const years = useMemo(() => {
        const uniqueYears = [...new Set(cars.map(car => new Date(car.created_at).getFullYear()))];
        return uniqueYears.sort((a, b) => a - b);
    }, [cars]);

    const monthlyData = useMemo(() => {
        const filteredCars = selectedYear === 'all'
            ? cars
            : cars.filter(car => new Date(car.created_at).getFullYear() === parseInt(selectedYear));

        const monthCounts = new Array(12).fill(0);

        filteredCars.forEach(car => {
            const month = new Date(car.created_at).getMonth();
            monthCounts[month]++;
        });

        return monthCounts.map((count, index) => ({
            month: new Date(2024, index).toLocaleString('es', { month: 'short' }),
            cantidad: count
        }));
    }, [cars, selectedYear]);

    // Modelos por marca de autos
    const [chartData, setChartData] = useState([])
    useEffect(() => {
        const brandCounts = cars.reduce((acc, car) => {
            acc[car.marca] = (acc[car.marca] || 0) + 1
            return acc
        }, {})

        const formattedData = Object.entries(brandCounts).map(([brand, count]) => ({
            brand,
            count
        }))

        setChartData(formattedData)
    }, [cars])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Distribución por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                    <Pie
                        data={{
                            labels: carTypes,
                            datasets: [{
                                data: carsByType,
                                backgroundColor: ['#3b82f6', '#ef4444'],
                            }],
                        }}
                    />
                </CardContent>
            </Card>
            <Card className="sm:col-span-2">
                <CardHeader>
                    <CardTitle>Autos por Año</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar
                        data={{
                            labels: carsByYear.map(([anio]) => anio),
                            datasets: [{
                                label: 'Cantidad de Autos',
                                data: carsByYear.map(([, count]) => count),
                                backgroundColor: '#3b82f6',
                            }],
                        }}
                    />
                </CardContent>
            </Card>
            <Card className="sm:col-span-3">
                <CardHeader>
                    <CardTitle>Autos por Marca</CardTitle>
                </CardHeader>
                <CardContent>
                    <Bar
                        data={{
                            labels: carsByBrand.map(([marca]) => marca),
                            datasets: [{
                                label: 'Cantidad de Autos',
                                data: carsByBrand.map(([, count]) => count),
                                backgroundColor: '#10b981',
                            }],
                        }}
                    />
                </CardContent>
            </Card>
            <Card className="sm:col-span-3 w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl sm:text-3xl md:text-4xl text-center">Modelos de Autos por Marca</CardTitle>
                    <CardDescription className="text-sm sm:text-base md:text-lg text-center">
                        Distribución de modelos entre diferentes marcas de automóviles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            count: {
                                label: "Número de Modelos",
                                color: "hsl(var(--chart-1))",
                            },
                        }}
                        className="w-full aspect-square max-w-[500px] mx-auto"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                <PolarGrid />
                                <PolarAngleAxis
                                    dataKey="brand"
                                    tick={{ fill: 'hsl(var(--foreground))', fontSize: '12px' }}
                                />
                                <Radar
                                    name="Modelos"
                                    dataKey="count"
                                    stroke="var(--color-count)"
                                    fill="var(--color-count)"
                                    fillOpacity={0.6}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="md:col-span-3">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Autos Agregados por Mes</CardTitle>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Seleccionar año" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                {years.map(anio => (
                                    <SelectItem key={anio} value={anio.toString()}>
                                        {anio}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#888888' }}
                                />
                                <YAxis
                                    tick={{ fill: '#888888' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px'
                                    }}
                                    formatter={(value) => [`${value} autos`, 'Cantidad']}
                                    labelFormatter={(label) => `Mes: ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="cantidad"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={{ fill: '#2563eb', r: 4 }}
                                    activeDot={{ r: 6, fill: '#1e40af' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>


        </motion.div>
    );
}

export default Graficas;

