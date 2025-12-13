
import { spawn } from 'child_process'

// Map to store active child processes: userId -> ChildProcess
const activeProcesses = new Map()

/**
 * Start a script-based reclassification process for a user.
 * Kills any existing process for the same user first.
 * 
 * @param {string} userId - The ID of the user
 * @param {string} scriptPath - Absolute path to the script
 * @param {Array} args - Arguments for the script
 * @param {string} cwd - Working directory
 */
export const startProcess = (userId, scriptPath, args, cwd) => {
    // If there's an active process for this user, kill it first
    stopProcess(userId)

    const child = spawn('node', [scriptPath, ...args], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false
    })

    // Store the process reference
    activeProcesses.set(userId, child)
    console.log(`🚀 Started reclassification process (PID ${child.pid}) for user ${userId}`)

    // Handle process exit to clean up the map
    child.on('exit', (code, signal) => {
        console.log(`🏁 Process (PID ${child.pid}) for user ${userId} exited with code ${code}`)
        activeProcesses.delete(userId)
    })

    // Log stderr in case of errors
    child.stderr.on('data', (data) => {
        console.error(`[Process Error User ${userId}]: ${data.toString()}`)
    })

    return child
}

/**
 * Stop (kill) the active reclassification process for a user.
 * 
 * @param {string} userId - The ID of the user
 */
export const stopProcess = (userId) => {
    const child = activeProcesses.get(userId)
    if (child) {
        console.log(`🛑 Stopping active reclassification process (PID ${child.pid}) for user ${userId} due to logout/request`)
        // Use tree-kill semantic if needed, but for simple spawn scripts, .kill() usually suffices.
        // 'SIGTERM' is standard termination signal.
        child.kill('SIGTERM')
        activeProcesses.delete(userId)
        return true
    }
    return false
}

/**
 * Check if a user has an active process running.
 * 
 * @param {string} userId 
 * @returns {boolean}
 */
export const hasActiveProcess = (userId) => {
    return activeProcesses.has(userId)
}
