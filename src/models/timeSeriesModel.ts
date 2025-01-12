// src/models/timeSeriesModel.ts

import * as tf from '@tensorflow/tfjs';
import { TimeSeriesData } from '../types';

/**
 * Calcula el MAPE (Mean Absolute Percentage Error)
 */
function computeMape(actual: number[], predicted: number[]): number {
  if (actual.length === 0 || actual.length !== predicted.length) {
    return NaN;
  }
  let sumPercentErrors = 0;
  for (let i = 0; i < actual.length; i++) {
    // Evitar división por cero
    if (actual[i] === 0) {
      continue;
    }
    const percentError = Math.abs((actual[i] - predicted[i]) / actual[i]);
    sumPercentErrors += percentError;
  }
  return (sumPercentErrors / actual.length) * 100;
}

export class TimeSeriesModel {
  private model: tf.LayersModel | null = null;

  constructor() {}

  /**
   * Entrena el modelo con los datos proporcionados.
   * @param data Arreglo de { date, value }
   * @param epochs Número de épocas
   * @param onEpochEnd Callback para reportar el avance (epoch, loss)
   */
  async train(
    data: TimeSeriesData[],
    epochs: number,
    onEpochEnd?: (epoch: number, loss: number) => void
  ) {
    // 1) Extraer array de valores numéricos
    const valuesArray = data.map((d) => d.value);

    // 2) Crear secuencias (ventanas) con tamaño windowSize
    const windowSize = 3; // Ajusta según tu estrategia
    const { X, Y } = createSequences(valuesArray, windowSize);

    // 3) Convertir a tensores 3D (para LSTM)
    const X3D = X.map((window) => window.map((val) => [val]));
    const tensorX = tf.tensor3d(X3D, [X3D.length, windowSize, 1]);
    const tensorY = tf.tensor2d(Y, [Y.length, 1]);

    // 4) Definir el modelo
    this.model = tf.sequential();
    this.model.add(
      tf.layers.lstm({
        units: 64,
        returnSequences: false,
        inputShape: [windowSize, 1],
      })
    );
    this.model.add(tf.layers.dense({ units: 1 }));

    this.model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError',
    });

    // 5) Entrenar
    await this.model.fit(tensorX, tensorY, {
      epochs,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (onEpochEnd && logs?.loss !== undefined) {
            onEpochEnd(epoch + 1, logs.loss);
          }
        },
      },
    });

    tensorX.dispose();
    tensorY.dispose();
  }

  /**
   * Realiza predicciones futuras a partir de los últimos datos.
   * @param data Arreglo de { date, value }
   * @param futurePeriods Número de periodos a predecir
   * @returns Arreglo de valores predichos
   */
  predict(data: TimeSeriesData[], futurePeriods: number): number[] {
    if (!this.model) {
      console.warn('Modelo no entrenado. Retornando arreglo vacío.');
      return [];
    }

    const windowSize = 3; // Debe coincidir con el usado en train
    const valuesArray = data.map((d) => d.value);
    const predictions: number[] = [];

    // Obtener la última ventana
    let currentWindow = valuesArray.slice(-windowSize);

    for (let i = 0; i < futurePeriods; i++) {
      const X3D = currentWindow.map((val) => [val]);
      const tensorX = tf.tensor3d([X3D], [1, windowSize, 1]);

      const predTensor = this.model.predict(tensorX) as tf.Tensor;
      const [predValue] = predTensor.dataSync() as Float32Array;
      predictions.push(predValue);

      // Actualizar la ventana
      currentWindow = [...currentWindow.slice(1), predValue];

      tensorX.dispose();
      predTensor.dispose();
    }

    return predictions;
  }

  /**
   * Calcula el MAPE en los datos de entrenamiento (in-sample) o en un subset
   * @param data Data real
   * @returns valor de MAPE (porcentaje)
   */
  calculateMapeOnTraining(data: TimeSeriesData[]): number {
    if (!this.model) {
      return NaN;
    }
    // Para calcular el MAPE con todos los datos de 'data' (in-sample),
    // hacemos predicción con "futurePeriods=0" usando la misma longitud,
    // O bien se re-ejecuta la lógica de ventana. 
    // Aquí haré un approach simplificado que predice un valor para cada punto,
    // pero OJO: esto no es 100% correcto para LSTM con ventana. 
    // Lo ideal es computar las salidas con sliding window.
    // Para ejemplo, haremos algo simple:
    const windowSize = 3;
    const valuesArray = data.map((d) => d.value);
    // Haremos predicciones sólo a partir del 3er elemento
    const predicted: number[] = [];
    const actual: number[] = [];
    for (let i = windowSize; i < valuesArray.length; i++) {
      // Tomar la ventana actual
      const window = valuesArray.slice(i - windowSize, i);
      const X3D = window.map((val) => [val]);
      const tensorX = tf.tensor3d([X3D], [1, windowSize, 1]);
      const predTensor = this.model.predict(tensorX) as tf.Tensor;
      const [predValue] = predTensor.dataSync() as Float32Array;
      predicted.push(predValue);
      actual.push(valuesArray[i]);
      tensorX.dispose();
      predTensor.dispose();
    }

    return computeMape(actual, predicted);
  }
}

/**
 * Crea secuencias (X, Y) para entrenamiento a partir de un arreglo 1D.
 * @param values Arreglo 1D de valores numéricos
 * @param windowSize Tamaño de la ventana (lag)
 */
function createSequences(values: number[], windowSize: number) {
  const X: number[][] = [];
  const Y: number[] = [];

  for (let i = 0; i < values.length - windowSize; i++) {
    const window = values.slice(i, i + windowSize);
    const label = values[i + windowSize];
    X.push(window);
    Y.push(label);
  }

  return { X, Y };
}
