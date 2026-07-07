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
};
