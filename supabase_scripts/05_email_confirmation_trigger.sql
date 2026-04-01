-- Create trigger function to send confirmation email when new registration is created
create or replace function public.handle_new_registration()
returns trigger as $$
begin
  -- Call the edge function asynchronously (fire and forget)
  perform net.http_post(
    url := 'https://lcmcdksqicoubmnqtafu.supabase.co/functions/v1/send-registration-confirmation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <anon_key>'
    ),
    body := jsonb_build_object(
      'record', row_to_json(NEW)
    )
  );
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger for after insert on registrations
drop trigger if exists on_new_registration on public.registrations;
create trigger on_new_registration
  after insert on public.registrations
  for each row execute procedure public.handle_new_registration();
