module.exports = {
    canales: {
        bienvenida: '1523547183608107089',
    },

    enlaces: {
        subdivision: 'https://discord.com/channels/1523544234823520388/1523547450726551693',
        funciones: 'https://discord.com/channels/1523544234823520388/1523547701109592064',
        postulacion: 'https://discord.com/channels/1523544234823520388/1523548265340076184',
    },

    mensajesMotivadores: [
        'La disciplina y el honor son la base de nuestra institución. ¡Bienvenido a las filas!',
        'Cada nuevo miembro fortalece nuestra misión de servir y proteger. ¡Éxitos en tu camino!',
        'El uniforme se lleva con orgullo, pero el compromiso se lleva en el corazón.',
        'Servir a la comunidad es el mayor honor. Hoy comienza tu historia con nosotros.',
    ],

    // Pega la URL de tu imagen aquí cuando la tengas
    imagenBienvenida: '',
 
    autoroles: [
        '1523715977370402916',
        '1523716317306163250',
        '1523716577193627860',
    ],
    jerarquia: {
        // Roles divisorios (solo visuales, no se asignan a usuarios)
        divisores: {
            oficiales: '1523572960290541568',
            suboficiales: '1523711481634488360',
            clases: '1523713150648844490',
            unidades: '1523714120329986140',
        },

        // Rangos ordenados del más alto al más bajo (útil para comandos de ascenso/descenso)
        rangos: [
            { id: '1523573395978190848', nombre: 'Director General' },
            { id: '1523573665982058557', nombre: 'SubDirector General' },
            { id: '1523573834077180005', nombre: 'Comisionado' },
            { id: '1523574021344591916', nombre: 'Sub Comisionado' },
            { id: '1523574454699954337', nombre: 'Mayor' },
            { id: '1523574599907016765', nombre: 'Capitán' },
            { id: '1523574922327101500', nombre: 'Teniente' },
            { id: '1523575112270614538', nombre: 'Subteniente' },
            { id: '1523712386031419463', nombre: 'Sargento Mayor' },
            { id: '1523712606664396975', nombre: 'Sargento Primero' },
            { id: '1523712744795279440', nombre: 'Sargento Segundo' },
            { id: '1523713416026656920', nombre: 'Cabo Primero' },
            { id: '1523713548209885315', nombre: 'Cabo Segundo' },
            { id: '1523713876129218610', nombre: 'Agente' },
            { id: '1523713987949105305', nombre: 'Cadete' },
        ],

        // Unidades especiales (no siguen la jerarquía de rango)
        unidades: [
            { id: '1523714460475326516', nombre: 'Unidad de la U.C.M' },
            { id: '1523714647469850746', nombre: 'Unidad de la U.T.O.A' },
            { id: '1523715087674769459', nombre: 'Unidad U.C.A.N' },
            { id: '1523715231728140358', nombre: 'Unidad de la U.T.E' },
            { id: '1523715360560251042', nombre: 'Unidad de la U.F.E.C' },
            { id: '1523715469889110067', nombre: 'Unidad Lince' },
            { id: '1523715607781048372', nombre: 'Unidad de la D.I.J' },
        ],
    },
    postulaciones: {
        rolAutorizado: '1523573395978190848', // Director General

        canales: {
            panel: '1523548265340076184',
            pendientes: '1523556743605391492',
            logAceptados: '1523556853022330970',
            logRechazados: '1523556950032515082',
            resultados: '1523549073624531065',
        },

        roles: {
            pendiente: '1523716463439904989',
            aprobado: '1523716817221189812',
            rechazado: '1523716944887283926',
            cadete: '1523713987949105305',
        },

        rangoPuntuacion: [
            { min: 180, max: 999, categoria: '🟢 Aprobado con excelencia' },
            { min: 160, max: 179, categoria: '🟢 Aprobado' },
            { min: 140, max: 159, categoria: '🟡 Aprobado con observaciones' },
            { min: 120, max: 139, categoria: '🟠 Entrevista obligatoria' },
            { min: 0, max: 119, categoria: '🔴 Reprobado' },
        ],

        preguntas: [
            { n: 1, texto: 'Nombre completo', puntos: 0, estilo: 'Short' },
            { n: 2, texto: 'Edad', puntos: 0, estilo: 'Short' },
            { n: 3, texto: 'Usuario de Discord', puntos: 0, estilo: 'Short' },
            { n: 4, texto: 'ID de Discord', puntos: 0, estilo: 'Short' },
            { n: 5, texto: 'País', puntos: 0, estilo: 'Short' },
            { n: 6, texto: '¿Cuánto tiempo puedes dedicar al servidor diariamente?', puntos: 5, estilo: 'Short' },
            { n: 7, texto: '¿Has pertenecido a alguna facción policial anteriormente? Explica.', puntos: 5, estilo: 'Paragraph' },
            { n: 8, texto: '¿Por qué deseas formar parte de la Policía Nacional?', puntos: 10, estilo: 'Paragraph' },
            { n: 9, texto: '¿Qué significa servir y proteger?', puntos: 10, estilo: 'Paragraph' },
            { n: 10, texto: '¿Qué valores debe tener un policía? Menciona al menos 5.', puntos: 10, estilo: 'Paragraph' },
            { n: 11, texto: '¿Qué harías si un ciudadano se niega a identificarse?', puntos: 10, estilo: 'Paragraph' },
            { n: 12, texto: '¿Qué harías si un compañero incumple el reglamento?', puntos: 10, estilo: 'Paragraph' },
            { n: 13, texto: '¿Qué harías si un superior te da una orden que consideras incorrecta?', puntos: 10, estilo: 'Paragraph' },
            { n: 14, texto: '¿Cómo actuarías en un control vehicular?', puntos: 10, estilo: 'Paragraph' },
            { n: 15, texto: 'Explica el procedimiento para una detención.', puntos: 10, estilo: 'Paragraph' },
            { n: 16, texto: '¿Cuándo es válido el uso progresivo de la fuerza?', puntos: 10, estilo: 'Paragraph' },
            { n: 17, texto: '¿Qué harías si un detenido intenta huir?', puntos: 10, estilo: 'Paragraph' },
            { n: 18, texto: '¿Qué harías si un civil intenta sobornarte?', puntos: 10, estilo: 'Paragraph' },
            { n: 19, texto: '¿Qué harías si recibes un reporte de robo en proceso?', puntos: 10, estilo: 'Paragraph' },
            { n: 20, texto: '¿Qué harías si llegas primero a un accidente de tránsito?', puntos: 10, estilo: 'Paragraph' },
            { n: 21, texto: 'Explica qué es el Metagaming (MG).', puntos: 5, estilo: 'Paragraph' },
            { n: 22, texto: 'Explica qué es el Powergaming (PG).', puntos: 5, estilo: 'Paragraph' },
            { n: 23, texto: 'Explica qué es el Deathmatch (DM).', puntos: 5, estilo: 'Paragraph' },
            { n: 24, texto: 'Explica qué es el Revenge Kill (RK).', puntos: 5, estilo: 'Paragraph' },
            { n: 25, texto: 'Explica qué es el Vehicle Deathmatch (VDM).', puntos: 5, estilo: 'Paragraph' },
            { n: 26, texto: 'Explica qué es el FearRP.', puntos: 5, estilo: 'Paragraph' },
            { n: 27, texto: '¿Cómo actuarías en una persecución policial?', puntos: 10, estilo: 'Paragraph' },
            { n: 28, texto: 'Escribe un procedimiento completo para identificar a un ciudadano.', puntos: 15, estilo: 'Paragraph' },
            { n: 29, texto: 'Realiza un rol completo de una detención con comandos (/me y /do si aplica).', puntos: 20, estilo: 'Paragraph' },
            { n: 30, texto: '¿Por qué deberíamos escogerte a ti y no a otro postulante?', puntos: 0, estilo: 'Paragraph' },
        ],
    },
};
