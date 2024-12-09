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
      <DialogContent className="sm:max-w-[800px] w-[90vw] h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-6 pb-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Car className="mr-2 h-4 w-4" /> Marca
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {uniqueBrands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={() => handleFilterChange('brands', brand)}
                    />
                    <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Año
              </h3>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                {uniqueanios.map(anio => (
                  <div key={anio} className="flex items-center space-x-2">
                    <Checkbox
                      id={`anio-${anio}`}
                      checked={filters.anios.includes(anio.toString())}
                      onCheckedChange={() => handleFilterChange('anios', anio.toString())}
                    />
                    <label htmlFor={`anio-${anio}`} className="text-sm">{anio}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <Tag className="mr-2 h-4 w-4" /> Tipo
              </h3>
              <div className="space-y-2">
                {carTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.types.includes(type)}
                      onCheckedChange={() => handleFilterChange('types', type)}
                    />
                    <label htmlFor={`type-${type}`} className="text-sm">{type}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    );
}

export default Filters;