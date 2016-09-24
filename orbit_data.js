var testData = {
    orbits: [
    {
        name: "test1",
        plotWindow: {
            xMin: -1,
            xMax: 1,
            yMin: -1,
            yMax: 1,
        },
        length: 10,
        particles: [
            {
                x:    0.5,
                y:    0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
            },
            {
                x:    -0.5,
                y:    0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
            },
            {
                x:    0.5,
                y:    -0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
            },
            {
                x:    -0.5,
                y:    -0.5,
                v_x:  0,
                v_y:  0,
                mass: 1,
            },
        ],
        info:
        {
            header: "Simple square",
            description: "Four particles on a square.",
            comment: "blah blah",
        }
    },
    ]
};
