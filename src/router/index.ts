import express, { Application, Request, Response } from "express";
import pLimit from "p-limit";
import { EmailBatch } from "../models/email_batches";
import { Order } from "../models/orders";
import { isValidEmail } from "../utils/is_valid_email";
import { sendEmail } from "../utils/send_email";
import { EmailAttempt } from "../models/email_attempt";
const router = express.Router();

router.post("/email-batches", async (req: Request, res: Response) => {
  const {
    started_by = "admin@system.com",
    from_date,
    to_date,
    dry_run = false,
    subject,
    text,
  } = req.body;

  const to = to_date ? new Date(to_date) : new Date();
  const from = from_date
    ? new Date(from_date)
    : new Date(to.getTime() - 6 * 24 * 60 * 60 * 1000);

  const new_batch = await EmailBatch.create({
    started_by,
    window_from: from,
    window_to: to,
    total_considered: 0,
    total_with_email: 0,
    sent_count: 0,
    failed_count: 0,
    status: "running",
  });

  const data_stream = Order.find({
    createdAt: {
      $gte: from,
      $lt: to,
    },
  }).cursor();

  const limit = pLimit(Number(process.env.CONCURRENCY || 20));
  const max_tries = Number(process.env.RETRIES || 3);
  const back_off = Number(process.env.BACKOFF_MS || 1500);

  let total = 0;
  let with_email = 0;
  let sent = 0;
  let failed = 0;

  const tasks: Promise<void>[] = [];

  for await (const order of data_stream) {
    total++;
    const email = order.email?.trim();
    if (!isValidEmail(email)) continue;

    with_email++;
    if (dry_run) continue;

    tasks.push(
      limit(async () => {
        const mail = { from: process.env.EMAIL_FROM, to: email, subject, text };
        const result = await sendEmail(mail, max_tries, back_off);
        if (result.success) {
          sent++;
          await EmailAttempt.create({
            batch_id: new_batch._id,
            order_id: order._id,
            email,
            status: "success",
            provider_messageId: result.info?.messageId || "",
            attempts: result.attempts,
            sentAt: new Date(),
          });
        } else {
          await EmailAttempt.create({
            batch_id: new_batch._id,
            order_id: order._id,
            email,
            status: "failed",
            error: result.error,
            attempts: result.attempts,
            sentAt: new Date(),
          });
        }
      })
    );
  }
  if (!dry_run && tasks.length) await Promise.allSettled(tasks);
  new_batch.total_considered = total;
  new_batch.total_with_email = with_email;
  new_batch.sent_count = sent;
  new_batch.fail_count = failed;
  new_batch.status = "completed";
  await new_batch.save();

  return res.status(200).json({
    batch_id: new_batch._id,
    window_from: from,
    window_to: to,
    dry_run,
    totals: { total, with_email, sent, failed },
    message: "Email batch processing completed",
    success: true,
  });
});

router.get("/email-batches", async (req: Request, res: Response) => {
  const batches = await EmailBatch.find();
  return res.status(200).json({
    message: "Email batches retrieved successfully",
    success: true,
    data: batches,
  });
});

router.get(
  "/email-batches/attempts/success/:batchId",
  async (req: Request, res: Response) => {
    const { batchId } = req.params;
    console.log(`Fetching successful email attempts for batch: ${batchId}`);
    const attempts = await EmailAttempt.find({
      batch_id: batchId,
      status: "success",
    });
    return res.status(200).json({
      message: "Email attempts retrieved successfully",
      success: true,
      data: attempts,
    });
  }
);

router.get(
  "/email-batches/attempts/failed/:batchId",
  async (req: Request, res: Response) => {
    const { batchId } = req.params;
    const attempts = await EmailAttempt.find({
      batch_id: batchId,
      status: "failed",
    });
    return res.status(200).json({
      message: "Email attempts retrieved successfully",
      success: true,
      data: attempts,
    });
  }
);

router.post("/place-order", async (req: Request, res: Response) => {
  const {
    order_id,
    full_name,
    email,
    phone_number,
    profession,
    remarks,
    amount,
    additional_products = [],
  } = req.body;
  if (
    !order_id ||
    !full_name ||
    !email ||
    !phone_number ||
    !profession ||
    !amount
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields", success: false });
  }

  const order = new Order({
    order_id,
    full_name,
    email,
    phone_number,
    profession,
    remarks,
    amount,
    additional_products,
  });

  await order.save();

  return res.status(201).json({
    message: "Order placed successfully",
    success: true,
    data: order,
  });
});

router.get("/orders", async (req: Request, res: Response) => {
  const orders = await Order.find();
  const count = await Order.countDocuments();
  return res.status(200).json({
    message: "Orders retrieved successfully",
    success: true,
    data: orders,
    count,
  });
});

export default router;
