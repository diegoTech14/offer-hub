import { supabase } from "@/lib/supabase/supabase";
import { InternalServerError } from "@/utils/AppError";

export async function getTaskRecordsByClient(client_id: string, limit: number, page: number, completed?: boolean) {

    const pageInt = Math.max(1, Number(page) || 1);
    const limitInt = Math.min(100, Math.max(1, Number(limit) || 20));
    const from = (pageInt - 1) * limitInt;
    const to = from + limitInt - 1;

    let query;

    if (typeof completed === 'boolean') {
        query = supabase
            .from('vw_task_records_for_client')
            .select('*', { count: 'exact' })
            .eq('client_id', client_id)
            .eq('completed', completed)
            .order('created_at', { ascending: false })
            .range(from, to);
    } else {
        query = supabase
            .from('vw_task_records_for_client')
            .select('*', { count: 'exact' })
            .eq('client_id', client_id)
            .order('created_at', { ascending: false })
            .range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw new InternalServerError(error.message);

    return {
        data: data ?? [],
        meta: {
            page: pageInt,
            limit: limitInt,
            total_items: count ?? 0
        }
    };
}