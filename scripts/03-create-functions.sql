-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_animals', (SELECT COUNT(*) FROM animals WHERE user_id = p_user_id),
    'healthy_animals', (SELECT COUNT(*) FROM animals WHERE user_id = p_user_id AND health_status = 'healthy'),
    'total_production', (SELECT COALESCE(SUM(quantity), 0) FROM production WHERE user_id = p_user_id AND production_date >= CURRENT_DATE - INTERVAL '30 days'),
    'total_sales', (SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE user_id = p_user_id AND sale_date >= CURRENT_DATE - INTERVAL '30 days'),
    'total_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = p_user_id AND expense_date >= CURRENT_DATE - INTERVAL '30 days'),
    'total_income', (SELECT COALESCE(SUM(amount), 0) FROM income WHERE user_id = p_user_id AND income_date >= CURRENT_DATE - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
