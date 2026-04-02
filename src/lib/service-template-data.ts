
export const tiposEquipo = [
    "Portátil",
    "Equipo de Escritorio",
    "Servidor",
    "All-in-One",
    "Workstation",
    "Tablet",
    "Otro"
];

export const tiposMemoria = [
    "DDR3",
    "DDR4",
    "DDR5",
    "LPDDR3",
    "LPDDR4",
    "LPDDR5",
    "Otro"
];

export const capacidadesMemoria = [
    "2GB",
    "4GB",
    "8GB",
    "16GB",
    "32GB",
    "64GB",
    "128GB"
];

export const tiposAlmacenamiento = [
    "HDD",
    "SSD",
    "NVMe",
    "M.2",
    "SATA",
    "Otro"
];

export const capacidadesAlmacenamiento = [
    "128GB",
    "256GB",
    "512GB",
    "1TB",
    "2TB",
    "4TB",
    "8TB"
];

export const tiposImpresora = [
    "Láser",
    "Inyección de tinta",
    "Matricial",
    "Térmica",
    "Plotter",
    "Multifunción",
    "Otro"
];

export const marcasImpresora = [
    "HP",
    "Canon",
    "Epson",
    "Brother",
    "Samsung",
    "Xerox",
    "Lexmark",
    "Dell",
    "Otro"
];

export const validaciones = {
    fecha: /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/,
    hora: /^[0-9]{2}:[0-9]{2}$/,
    telefono: /^[0-9]{9,15}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    numeroSerie: /^[a-zA-Z0-9]{6,20}$/,
    precio: /^[0-9]+(\.[0-9]{2})?$/
};
