import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { projectId, title, content } = await req.json();

        if (!projectId || !title || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('projects')
            .upsert({
                id: projectId,
                user_id: "00000000-0000-0000-0000-000000000000", // system generated
                title,
                type: "slides",
                content,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error("Supabase Save Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, project: data });
    } catch (error: any) {
        console.error("API Save Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save project" },
            { status: 500 }
        );
    }
}
