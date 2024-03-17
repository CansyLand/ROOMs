import { Entity, GltfContainer, MeshRenderer } from '@dcl/sdk/ecs'

export function generateRandomString(length = 5) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

/**
 * Creates a substring extractor for a given string. This extractor function returns
 * another function that, when called with a length, returns a substring of that length
 * starting from the current position in the original string. After reaching the end
 * of the string, it loops back to the beginning, allowing for continuous substring
 * extraction in a cyclic manner. The extractor keeps track of the position, ensuring
 * sequential extraction based on the last extraction point.
 *
 * @param initialString The initial string from which substrings will be extracted.
 * @returns A function that takes a length (number) and returns a substring of the
 *          specified length from the initial string, looping back to the start if
 *          the end is reached.
 */
export function createSubstringExtractor(initialString: string) {
  let currentPosition = 0 // Keeps track of the current position within the string

  return function getNextSubstring(length: number): string {
    const totalLength = initialString.length
    let substring: string

    // Check if we need to loop back to the start of the string
    if (currentPosition + length > totalLength) {
      // If the requested substring extends beyond the string's end, wrap around
      substring =
        initialString.substring(currentPosition) + initialString.substring(0, (currentPosition + length) % totalLength)
      currentPosition = (currentPosition + length) % totalLength
    } else {
      // Extract the substring normally
      substring = initialString.substring(currentPosition, currentPosition + length)
      currentPosition += length
    }

    return substring
  }
}

/**
 * Maps a number from its original range to a specified target range.
 *
 * @param value The number to be mapped.
 * @param minTarget The minimum value of the target range.
 * @param maxTarget The maximum value of the target range.
 * @returns The number mapped to the target range.
 */
export function mapNumberToRange(value: number, minTarget: number, maxTarget: number): number {
  // Determine the maximum possible value based on the length of the input number
  const maxBase = Math.pow(10, value.toString().length) - 1

  // Normalize the value to a 0-1 range (relative to its possible max value)
  const normalized = value / maxBase

  // Scale the normalized value to the target range
  return minTarget + normalized * (maxTarget - minTarget)
}

/**
 * Extracts a substring using a given extractor function, parses the substring to an integer,
 * and then maps this integer from its original range (based on its length) to a specified target range.
 *
 * @param {Function} extractor A function that extracts the next substring of a given length from a larger string.
 * @param {number} length The length of the substring to extract.
 * @param {number} minRange The minimum value of the target range.
 * @param {number} maxRange The maximum value of the target range.
 * @returns {number} The extracted and mapped number, now within the specified target range.
 */

export function extractAndMap(
  extractor: (length: number) => string,
  length: number,
  minRange: number,
  maxRange: number
) {
  const extractedValue = parseInt(extractor(length), 10)
  return mapNumberToRange(extractedValue, minRange, maxRange)
}

// Ads visible shape like 'box', 'sphere' or gltf
export function addShape(entity: Entity, shape: string): void {
  //sceneManager.addEntiy()
  switch (shape) {
    case 'box':
      MeshRenderer.setBox(entity)
      //sceneManager.addPolygon(12)
      break

    case 'plane':
      MeshRenderer.setPlane(entity)
      break

    case 'sphere':
      MeshRenderer.setSphere(entity)
      break

    case 'cylinder':
      MeshRenderer.setCylinder(entity, 1, 1)
      break

    case 'cone':
      MeshRenderer.setCylinder(entity, 0, 1)
      break

    default:
      GltfContainer.create(entity, {
        src: shape
      })
      break
  }
}

// Helper function for linear interpolation (lerp)
export function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

export function moveTowards(current: number, target: number, maxDelta: number) {
  if (Math.abs(target - current) <= maxDelta) return target
  return current + Math.sign(target - current) * maxDelta
}

// Ease-out function: starts fast, then decelerates
export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

// Adjust the lerp function to include easing
export function lerpWithEasing(start: number, end: number, t: number) {
  // Apply an easing function to 't'
  const tEased = easeOutCubic(t)
  return lerp(start, end, tEased)
}
