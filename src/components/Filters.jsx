/* eslint-disable react/prop-types */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Car, Filter, Tag } from 'lucide-react';

function Filters({uniqueBrands = [], uniqueanios = [], carTypes = [], filters, handleFilterChange}) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] h-[80%]">
                <DialogHeader>
                    <DialogTitle>Filtros</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                    <ScrollArea className="h-[90%] w-full rounded-md border p-4">
                        <div className="flex gap-20 justify-center">
                            <div>
                                <h3 className="mb-2 font-semibold flex items-center"><Car className="mr-2 h-4 w-4" /> Marca</h3>
                                {uniqueBrands.map(brand => (
                                    <div key={brand} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`brand-${brand}`}
                                            checked={filters.brands.includes(brand)}
                                            onCheckedChange={() => handleFilterChange('brands', brand)}
                                        />
                                        <label htmlFor={`brand-${brand}`}>{brand}</label>
                                    </div>
                                ))}
                            </div>
                            <div className='flex flex-col gap-5'>
                                <div>
                                    <h3 className="mb-2 font-semibold flex items-center"><Calendar className="mr-2 h-4 w-4" /> Año</h3>
                                    {uniqueanios.map(anio => (
                                        <div key={anio} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`anio-${anio}`}
                                                checked={filters.anios.includes(anio.toString())}
                                                onCheckedChange={() => handleFilterChange('anios', anio.toString())}
                                            />
                                            <label htmlFor={`anio-${anio}`}>{anio}</label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3 className="mb-2 font-semibold flex items-center"><Tag className="mr-2 h-4 w-4" /> Tipo</h3>
                                    {carTypes.map(type => (
                                        <div key={type} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${type}`}
                                                checked={filters.types.includes(type)}
                                                onCheckedChange={() => handleFilterChange('types', type)}
                                            />
                                            <label htmlFor={`type-${type}`}>{type}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default Filters;