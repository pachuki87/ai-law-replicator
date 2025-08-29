import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtdypqcoafrmvndbpqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZHlwcWNvYWZybXZuZGJwcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzA1OTcsImV4cCI6MjA3MTQ0NjU5N30.C5LkdatP_OkS6YsivPlQvGxrz7VI5z_0w4dVeKffMSQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
export type { Database } from './types';