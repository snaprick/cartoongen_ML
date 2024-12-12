var Config = {
    colors: {
        theme: '#6A669D',
        themeDarker: '#1C325B'
    },
    defaultModel: 'Cartooner',
    modelList: ['Amaryllis', 'Bouvardia128', 'Bouvardia256', 'Cartooner'],
    modelCompression: true,
    modelConfig: {
        Cartooner: {
            name: 'Cartooner',
            options: [
                {
                    key: 'hair_color',
                    type: 'multiple',
                    options: ['blonde', 'brown', 'black', 'blue', 'pink', 'purple', 'green', 'red', 'silver', 'white', 'orange', 'aqua', 'grey'],
                    offset: 0,
                    prob: [0.15968645, 0.21305391, 0.15491921, 0.10523116, 0.07953927,
                        0.09508879, 0.03567429, 0.07733163, 0.03157895, 0.01833307,
                        0.02236442, 0.00537514, 0.00182371]
                },
                {
                    key: 'hair_style',
                    type: 'multiple',
                    options: ['long_hair', 'short_hair', 'twin_tail', 'drill_hair', 'ponytail'],
                    offset: 23,
                    //prob: [0.52989922,  0.37101264,  0.12567589,  0.00291153,  0.00847864],
                    isIndependent: true,
                    prob: Array.apply(null, {length: 5}).fill(0.25)
                },
                {
                    key: 'eye_color',
                    type: 'multiple',
                    options: ['blue', 'red', 'brown', 'green', 'purple', 'yellow', 'pink', 'aqua', 'black', 'orange'],
                    offset: 13,
                    prob: [0.28350664, 0.15760678, 0.17862742, 0.13412254, 0.14212126,
                        0.0543913, 0.01020637, 0.00617501, 0.03167493, 0.00156775]
                },
                {
                    key: 'dark_skin',
                    type: 'binary',
                    offset: 28,
                    prob: 0.05
                },
                {
                    key: 'blush',
                    type: 'binary',
                    offset: 29,
                    prob: 0.6
                },
                {
                    key: 'smile',
                    type: 'binary',
                    offset: 30,
                    prob: 0.6
                },
                {
                    key: 'open_mouth',
                    type: 'binary',
                    offset: 31,
                    prob: 0.25
                },
                {
                    key: 'hat',
                    type: 'binary',
                    offset: 32,
                    prob: 0.04488882
                },
                {
                    key: 'ribbon',
                    type: 'binary',
                    offset: 33,
                    prob: 0.3
                },
                {
                    key: 'glasses',
                    type: 'binary',
                    offset: 34,
                    prob: 0.05384738
                },
                {
                    key: 'year',
                    type: 'continuous',
                    min: -1.5,
                    max: 1.5,
                    step: 0.1,
                    samplingMin: -1,
                    samplingMax: 1,
                    offset: 35,
                    prob: 0.8
                }
            ],
            gan: {
                noiseLength: 128,
                labelLength: 36,
                imageWidth: 256,
                imageHeight: 256,
                model: '/models/Camellia',
                modelServers: [window.location.host]
            },
        },
    },
};

export default Config;