CREATE TRIGGER handle_organizations_updated_at BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime (updated_at);

-- TODO: Add trigger for other tables