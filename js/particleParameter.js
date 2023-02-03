/**
 * This class helps with the parameterisation of the particles. In order to create a lively and "random" behaviour per particle, 
 * it is necessary to change certain parameters over time. E.G.: Size, speed etc.
 */
class particleParameter {
    /**
     * Original rate of change. Used to randomly change the rate of change. This makes random changes even more random.
     * @type {number}
     */
    #originalChangeRate

    /**
     * The minimum value that a parameter can assume.
     * @type {number}
     */
    MinimumValue;

    /**
     * The maximum value that a parameter can assume.
     * @type {number}
     */
    MaximumValue;

    /**
     * The rate of change of a parameter. With each loop pass, the parameters of the particles are adjusted by adding the rate of change to the current value. 
     * For this to work well, the sign of this rate of change must be changed each time one of the defined maximum or minimum values is reached or exceeded.
     * @type {number}
     */
    ChangeRate;

    /**
     * The current value of the parameter.
     * @type {number}
     */
    CurrentValue;

    /**
     * Ctor.
     * Current value is set randomly between min and max.
     * 
     * @param {number} min          Minimum value of current value
     * @param {number} max          Maximum value of current value
     * @param {number} changeRate   Change rate
     * @param {number} startValue   Start value / Current value
     */
    constructor(min, max, changeRate, startValue) {
        this.MinimumValue = min;
        this.MaximumValue = max;
        this.ChangeRate = changeRate;
        this.CurrentValue = startValue;
        this.#originalChangeRate = changeRate;
    }

    /**
     * Increases the current value by adding the change rate. 
     * To prevent the current value from growing to infinity, the sign of "ChangeRate" is always changed 
     * as soon as one of the thresholds "MinimumValue" or "MaximumValue" is reached or exceeded.
     */
    IncreaseCurrentValue() {
        this.CurrentValue += this.ChangeRate;
        if (this.CurrentValue <= this.MinimumValue) {
            this.ChangeRate = Math.abs(this.ChangeRate);
        }
        if (this.CurrentValue >= this.MaximumValue) {
            this.ChangeRate = Math.abs(this.ChangeRate) * (-1);
        }
    }

    /**
     * Randomize current value between min and max.
     */
    RandomizeCurrentValue() {
        this.CurrentValue = getRandom(this.MinimumValue, this.MaximumValue);
    }

    /** Randomize change rate by multiplication with random number [0.8, 1.2] and randomly change the sign. */
    RandomizeChangeRate() {
        this.ChangeRate = getRandom(0.7, 1.3) * this.#originalChangeRate * changeSignRandom();
    }

    /** Clone current object 
     * @returns {particleParameter} Returns the new object
    */
    Clone() {
        let result = new particleParameter(this.MinimumValue, this.MaximumValue, this.ChangeRate);
        result.CurrentValue = this.CurrentValue;
        result.#originalChangeRate = this.#originalChangeRate;
        return result;
    }
}
