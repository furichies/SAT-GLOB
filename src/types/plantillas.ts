
export interface MetadatosMantenimiento {
    periodicidad: 'mensual' | 'trimestral' | 'semestral' | 'anual';
    hardware: {
        fuenteAlimentacion: boolean;
        ventilacion: boolean;
        discoDuro: boolean;
        memoriaRam: boolean;
        tarjetaGrafica: boolean;
        placaBase: boolean;
        conectividad: boolean;
        perifericos: boolean;
    };
    limpiezaFisica: boolean;
    observacionesHardware: string;
    software: {
        actualizacionesSo: 'completas' | 'pendientes';
        actualizacionesAntivirus: 'ok' | 'requiere_atencion';
        espacioDiscoLibre: number;
        fragmentacion: boolean;
        programasInstalados: 'revisado' | 'limpieza_realizada' | 'no_aplica';
        licenciasVigentes: 'ok' | 'renovaciones' | 'no_aplica';
        copiasSeguridad: {
            ultimaCopia?: string; // Fecha ISO
            estado: boolean;
        };
    };
    rendimiento: {
        tiempoArranqueActual: number;
        tiempoArranqueAnterior?: number;
        testRendimiento: 'optimo' | 'aceptable' | 'mejorable';
    };
    recomendaciones: {
        ampliacionRam: boolean;
        actualizacionSsd: boolean;
        renovacionEquipo: boolean;
        antiguedadEquipo?: number;
        mejoraSeguridad: string;
        otras: string;
    };
    proximoMantenimiento?: string; // Fecha ISO
}

export interface MetadatosInstalacion {
    proyecto?: string;
    duracionHoras: number;
    equipamiento: {
        descripcion: string;
        marcaModelo: string;
        numSerie: string;
        cantidad: number;
        ubicacion: string;
    }[];
    configuracion: {
        sistemaOperativo: boolean;
        red: boolean;
        dominio: boolean;
        email: boolean;
        softwareEspecifico: string[];
        impresoras: boolean;
        migracionDatos: string; // Origen
        seguridad: boolean;
        politicas: boolean;
        backup: boolean;
    };
    documentacionEntregada: {
        manualUsuario: boolean;
        guiaPrimerosPasos: boolean;
        credenciales: boolean;
        licencias: boolean;
        garantias: boolean;
    };
    formacion: {
        impartida: boolean;
        duracionMinutos: number;
        temas: string[];
        nivelComprension: 'alto' | 'medio' | 'bajo';
    };
    periodoPrueba: 7 | 15 | 30;
    confirmacionUsuario: boolean;
}

export interface MetadatosEntrega {
    equipo: {
        tipo: string;
        marcaModelo: string;
        numSerie: string;
        accesorios: string;
    };
    reparacion: {
        descripcionTecnica: string;
        componentes: string[];
        garantiaMeses: number;
        garantiaHasta: string; // Fecha ISO
    };
    estadoFinal: {
        operatividad: 'total' | 'limitada' | 'configuracion_adicional';
        detallesLimitacion?: string;
        datosUsuario: 'conservados' | 'formateados' | 'backup_entregado';
        backupUbicacion?: string;
    };
    instrucciones: string[];
    recomendaciones: {
        actualizarSistemaDias?: number;
        backupPeriodico: boolean;
        proteccionAdicional?: string;
        proximaRevision?: string; // Fecha ISO
    };
    conforme: boolean;
}

export interface MetadatosAccesoRemoto {
    equiposAutorizados: {
        nombreId: string;
        ipIdRemoto: string;
        sistema: string;
    }[];
    tipoAcceso: {
        soportePuntual: boolean;
        mantenimientoProgramado: boolean;
        periodoMantenimiento?: string;
        monitorizacionContinua: boolean;
        instalacionSoftware: boolean;
        resolucionIncidencia: string; // Numero ticket
    };
    limitaciones: {
        horario?: {
            desde: string;
            hasta: string;
            dias: string;
        };
        accesoRestringidoA?: string;
        noAutorizadoPara?: string;
    };
    vigencia: {
        desde: string; // Fecha ISO
        hasta?: string; // Fecha ISO
    };
    autorizante: {
        nombre: string;
        cargo: string;
        empresa: string;
        cif: string;
        telefono: string;
        email: string;
    };
}

export interface MetadatosEncuesta {
    valoracionTecnica: {
        tiempoRespuesta: 1 | 2 | 3 | 4 | 5;
        profesionalidad: 1 | 2 | 3 | 4 | 5;
        claridad: 1 | 2 | 3 | 4 | 5;
        resolucion: 1 | 2 | 3 | 4 | 5;
        tiempoTotal: 1 | 2 | 3 | 4 | 5;
    };
    valoracionGlobal: {
        recomendaria: boolean;
        volveriaSolicitar: boolean;
        requiereSeguimiento: boolean;
    };
    comentarios: {
        positivos: string;
        mejorar: string;
        adicionales: string;
    };
    autorizaTestimonio: boolean;
    usoInterno?: {
        costeTotal?: number;
        tiempoInvertido?: number;
        rentabilidad?: 'alta' | 'media' | 'baja';
        leccionesAprendidas?: string;
    };
}

export interface MetadatosMantenimientoPreventivo {
    equipo: string;
    periodicidad: 'mensual' | 'trimestral' | 'semestral' | 'anual';
    revisionHardware: {
        fuenteAlimentacion: { estado: 'ok' | 'ko'; accion: string };
        ventilacion: { estado: 'ok' | 'ko'; accion: string };
        discoDuro: { estado: 'ok' | 'ko'; accion: string };
        memoriaRam: { estado: 'ok' | 'ko'; accion: string };
        tarjetaGrafica: { estado: 'ok' | 'ko'; accion: string };
        placaBase: { estado: 'ok' | 'ko'; accion: string };
        conectividad: { estado: 'ok' | 'ko'; accion: string };
        perifericos: { estado: 'ok' | 'ko'; accion: string };
    };
    limpiezaFisica: boolean;
    observacionesHardware: string;
    revisionSoftware: {
        actualizacionesSo: 'completas' | 'pendientes';
        detallesPendientes?: string;
        actualizacionesAntivirus: 'ok' | 'requiere_atencion';
        espacioDiscoLibre: number;
        fragmentacion: 'ok' | 'desfragmentado';
        programasInstalados: 'revisado' | 'limpieza_realizada';
        licenciasVigentes: 'ok' | 'renovaciones';
        detallesRenovaciones?: string;
        copiasSeguridad: {
            ultimaCopia?: string;
            estado: boolean;
        };
    };
    rendimiento: {
        tiempoArranqueActual: number;
        tiempoArranqueAnterior?: number;
        testRendimiento: 'optimo' | 'aceptable' | 'mejorable';
    };
    recomendaciones: {
        ampliacionRam: boolean;
        actualizacionSsd: boolean;
        renovacionEquipo: boolean;
        antiguedadEquipo?: number;
        mejoraSeguridad: string;
        otras: string;
    };
    proximoMantenimiento?: string;
}

export interface MetadatosInstalacionConfiguracion {
    proyecto: string;
    duracionHoras: number;
    equipamiento: {
        descripcion: string;
        marcaModelo: string;
        numSerie: string;
        cantidad: number;
        ubicacion: string;
    }[];
    configuracion: {
        sistemaOperativo: boolean;
        detallesSo?: string;
        red: boolean;
        detallesRed?: string;
        dominio: boolean;
        detalleDominio?: string;
        email: boolean;
        detalleEmail?: string;
        softwareEspecifico: string[];
        impresoras: boolean;
        detalleImpresoras?: string;
        migracionDatos: string;
        seguridad: boolean;
        detalleSeguridad?: string;
        politicas: boolean;
        detallePoliticas?: string;
        backup: boolean;
        detalleBackup?: string;
    };
    documentacionEntregada: {
        manualUsuario: boolean;
        guiaPrimerosPasos: boolean;
        credenciales: boolean;
        licencias: boolean;
        garantias: boolean;
    };
    formacion: {
        impartida: boolean;
        duracionMinutos: number;
        temas: string[];
        nivelComprension: 'alto' | 'medio' | 'bajo';
    };
    periodoPrueba: 7 | 15 | 30;
    contactoSoporte: string;
    confirmacionUsuario: boolean;
}
