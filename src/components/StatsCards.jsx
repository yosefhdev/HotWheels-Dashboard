/* eslint-disable react/prop-types */
import { Car, CarFront, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from 'framer-motion';

function StatsCards({ cars, carsByType }) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-5"
        >
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-center gap-2 pb-2">
                    <div>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-medium">Total de Autos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-center">{cars.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-center gap-2 pb-2">
                    <div>
                        <CarFront className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-medium">Autos Básicos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-center">{carsByType[0]}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-center gap-2 pb-2">
                    <div>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-sm font-medium">Autos Premium</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-center">{carsByType[1]}</div>
                </CardContent>
            </Card>
        </motion.div>

    );
}

export default StatsCards;