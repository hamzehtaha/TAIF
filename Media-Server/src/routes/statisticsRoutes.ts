import { Router, Request, Response } from 'express';
import { statisticsService } from '../services/statisticsService';
import { adminAuthMiddleware } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/apiResponse';
import os from 'os';

const router = Router();

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     summary: Get comprehensive system statistics
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     server:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           description: Server uptime in seconds
 *                         platform:
 *                           type: string
 *                         nodeVersion:
 *                           type: string
 *                         cpuUsage:
 *                           type: object
 *                         memoryUsage:
 *                           type: object
 *                     media:
 *                       type: object
 *                       properties:
 *                         totalVideos:
 *                           type: number
 *                         activeUploads:
 *                           type: number
 *                         activeTranscodes:
 *                           type: number
 *                         activeStreams:
 *                           type: number
 *                         totalStreamsServed:
 *                           type: number
 *                         diskUsage:
 *                           type: number
 *                     performance:
 *                       type: object
 *                       properties:
 *                         averageUploadTime:
 *                           type: number
 *                         averageTranscodeTime:
 *                           type: object
 *                         peakConcurrentUploads:
 *                           type: number
 *                         peakConcurrentStreams:
 *                           type: number
 */
router.get('/api/admin/statistics', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const stats = statisticsService.getStats();
        
        // Server statistics
        const serverStats = {
            uptime: process.uptime(),
            platform: os.platform(),
            nodeVersion: process.version,
            cpuUsage: process.cpuUsage(),
            memoryUsage: {
                ...process.memoryUsage(),
                totalSystemMemory: os.totalmem(),
                freeSystemMemory: os.freemem(),
                usedSystemMemory: os.totalmem() - os.freemem()
            },
            cpuInfo: {
                model: os.cpus()[0]?.model || 'Unknown',
                cores: os.cpus().length,
                loadAverage: os.loadavg()
            }
        };

        // Media statistics
        const mediaStats = {
            totalVideos: stats.totalVideos,
            activeUploads: stats.activeUploads,
            activeTranscodes: stats.activeTranscodes,
            activeStreams: stats.activeStreams,
            totalStreamsServed: stats.totalStreamsServed,
            diskUsage: stats.totalDiskUsage
        };

        // Performance metrics
        const performanceStats = {
            averageUploadTime: stats.averageUploadTime,
            averageTranscodeTime: stats.averageTranscodeTime,
            peakConcurrentUploads: stats.peakConcurrentUploads,
            peakConcurrentStreams: stats.peakConcurrentStreams
        };

        sendSuccess(res, {
            server: serverStats,
            media: mediaStats,
            performance: performanceStats
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        sendError(res, 500, 'STATS_ERROR', 'Failed to retrieve statistics', { details: errorMessage });
    }
});

export default router;
