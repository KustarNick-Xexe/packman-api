function isPackable(boxes, orientations, bin) {
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].orientation = orientations[i];
    }
    const packingResult = bin.pack(boxes);
    return packingResult.length === boxes.length;
}

function generatePopulation(size, boxes, bin) {
    const population = []
    for (let i = 0; i < size; i++) {
        let orientations = []
        do {
            orientations = [];
            for (let j = 0; j < boxes.length; j++) {
                const orientation = Math.floor(Math.random() * 6);
                orientations.push(orientation);
            }
        } while (!isPackable(boxes, orientations, bin));
        population.push(orientations);
    }
    return population;
}

function crossover(boxes, orientations1, orientations2, bin) {
    let child = [];
    do {
        const midpoint = Math.floor(Math.random() * orientations1.length) + 1;
        child = orientations1.slice(0, midpoint).concat(orientations2.slice(midpoint));
    } while (!isPackable(boxes, child, bin));
    return child;
}

function mutate(boxes, orientations, bin) {
    const index = Math.floor(Math.random() * orientations.length);
    do {
        const newOrientation = Math.floor(Math.random() * 6);
        orientations[index] = newOrientation;
    } while (!isPackable(boxes, orientations, bin));
    return orientations;
}

function fitness(boxes, orientations, bin) {
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].orientation = orientations[i];
    }

    let result = 0;
    for (let i = 0; i < boxes.length; i++) {
        result += (bin.binHeight - (boxes[i].y + boxes[i].h))
    }

    return  result;
}

function select(boxes, population, bin) {
    const selection = []
    for (let i = 0; i < population.length; i++) {
        selection.push({ 
            index: i, 
            fitness: fitness(boxes, population[i], bin) 
        });
    }
    return selection.sort((current, next) => next.fitness - current.fitness).slice(0, 5);
}

const POPULATION_SIZE = 2;
const MAX_GENERATIONS = 2;
const MUTATION_RATE = 0.5;

function newGeneration(boxes, population, bin) {
    const newPopulation = [];
    const selection = select(boxes, population, bin);
    for (let i = 0; i < POPULATION_SIZE; i++) {
        const parent1 = population[selection[Math.floor(Math.random() * selection.length)].index];
        const parent2 = population[selection[Math.floor(Math.random() * selection.length)].index];
        let child = crossover(boxes, parent1, parent2, bin);
        if (Math.random() < MUTATION_RATE) {
          child = mutate(boxes, child, bin);
        }
        newPopulation.push(child);
    }
    return newPopulation;
}

module.exports.geneticAlgorithm = function geneticAlgorithm(boxes, bin) {
    let population = generatePopulation(POPULATION_SIZE, boxes, bin);
    for (let i = 0; i < MAX_GENERATIONS; i++) {
        population = newGeneration(boxes, population, bin);
    }
    const finalSelection = select(boxes, population, bin)[0];
    bin.save(boxes);
    return [population[finalSelection.index], boxes];
}