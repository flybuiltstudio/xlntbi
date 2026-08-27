CREATE POLICY "stripe_webhook_events_no_client_access"
  ON public.stripe_webhook_events
  FOR SELECT
  TO authenticated
  USING (false);