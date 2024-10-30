import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Loader() {
    // eslint-disable-next-line no-unused-vars
    const [windowWidth, setWindowWidth] = useState(0)

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth)
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
            <div className="relative w-64 h-64 mb-8">
                <motion.svg
                    width="256"
                    height="256"
                    viewBox="0 0 256 256"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    {/* Neumático */}
                    <circle cx="128" cy="128" r="64" fill="#1a1a1a" />

                    {/* Rin */}
                    <circle cx="128" cy="128" r="50" fill="#333" stroke="#666" strokeWidth="4" />

                    {/* Rayos del rin */}
                    {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
                        <rect
                            key={index}
                            x="126"
                            y="78"
                            width="4"
                            height="50"
                            fill="#666"
                            transform={`rotate(${rotation} 128 128)`}
                        />
                    ))}

                    {/* Centro del rin */}
                    <circle cx="128" cy="128" r="15" fill="#666" />

                    {/* Detalles del neumático */}
                    <circle cx="128" cy="128" r="62" fill="none" stroke="#333" strokeWidth="4" strokeDasharray="10 5" />
                </motion.svg>

                {/* Humo (fuera del SVG giratorio) */}
                <svg width="256" height="256" viewBox="0 0 256 256" className="absolute top-0 left-0">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <motion.circle
                            key={`smoke-${index}`}
                            cx={128 + index * 15}
                            cy={200 - index * 10}
                            r={10 + index * 2}
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
                className="text-xl font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
                Cargando colección de autos... 🏁
            </motion.p>
        </div>
    )
}