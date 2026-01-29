import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create Report
  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      const report = await storage.createReport(input);
      res.status(201).json(report);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Get Report Status
  app.get(api.reports.status.path, async (req, res) => {
    const protocol = req.params.protocol;
    const report = await storage.getReportByProtocol(protocol);
    if (!report) {
      return res.status(404).json({ message: 'Protocolo não encontrado' });
    }
    res.json(report);
  });

  return httpServer;
}
