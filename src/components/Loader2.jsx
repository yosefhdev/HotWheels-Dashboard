
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Loader2() {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="relative" style={{ width: '200px', height: '200px' }}>
                <motion.svg
                    width="200"
                    height="200"
                    viewBox="0 0 200 200"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    {/* Neumático */}
                    <circle cx="100" cy="100" r="80" fill="#1a1a1a" />

                    {/* Rin */}
                    <circle cx="100" cy="100" r="60" fill="#333" stroke="#666" strokeWidth="4" />

                    {/* Rayos del rin */}
                    {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
                        <rect
                            key={index}
                            x="98"
                            y="40"
                            width="4"
                            height="60"
                            fill="#666"
                            transform={`rotate(${rotation} 100 100)`}
                        />
                    ))}

                    {/* Centro del rin */}
                    <circle cx="100" cy="100" r="15" fill="#666" />

                    {/* Detalles del neumático */}
                    <circle cx="100" cy="100" r="75" fill="none" stroke="#333" strokeWidth="4" strokeDasharray="10 5" />
                </motion.svg>

                {/* Humo */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="absolute top-0 left-0">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <motion.circle
                            key={`smoke-${index}`}
                            cx={100 + index * 15}
                            cy={160 - index * 10}
                            r={5 + index * 2}
                            fill="#666"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{
                                opacity: [0, 0.7, 0],
                                scale: [0.5, 1.5, 2],
                                y: [0, -30 - index * 5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeOut",
                            }}
                        />
                    ))}
                </svg>
            </div>
            <motion.p
                className="absolute bottom-10 text-xl font-semibold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
                Cargando colección de autos...
            </motion.p>
        </div>
    )
}