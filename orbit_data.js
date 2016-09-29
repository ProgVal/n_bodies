var testData = {
    orbits: [
    {
        name: "Static Square",
        plotWindow: {
            xMin: -1,
            xMax: 1,
            yMin: -1,
            yMax: 1,
        },
        timeInterval: 5,
        particles: [
            {
                x:    0.5,
                y:    0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
                radius: 5,
            },
            {
                x:    -0.5,
                y:    0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
                radius: 5,
            },
            {
                x:    0.5,
                y:    -0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
                radius: 5,
            },
            {
                x:    -0.5,
                y:    -0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
                radius: 5,
            },
        ],
        info:
        {
            header: "Simple square",
            description: "Four particles on a square.",
            comment: "blah blah",
        }
    },
    {
        name: "Sliding Square",
        plotWindow: {
            xMin: -1,
            xMax: 1,
            yMin: -1,
            yMax: 1,
        },
        timeInterval: 5,
        particles: [
            {
                x:    0.5,
                y:    0.5,
                v_x:  0.1,
                v_y:  0.1,
                mass: 1,
                radius: 5,
            },
            {
                x:    -0.5,
                y:    0.5,
                v_x:  0.1,
                v_y:  0.1,
                mass: 1,
                radius: 5,
            },
            {
                x:    0.5,
                y:    -0.5,
                v_x:  0.1,
                v_y:  0.1,
                mass: 1,
                radius: 5,
            },
            {
                x:    -0.5,
                y:    -0.5,
                v_x:  0.1,
                v_y:  0.1,
                mass: 1,
                radius: 5,
            },
        ],
        info:
        {
            header: "Sliding square",
            description: "Four particles on a square, sliding toward a corner.",
            comment: "blah blah",
        }
    },
    ]
};
