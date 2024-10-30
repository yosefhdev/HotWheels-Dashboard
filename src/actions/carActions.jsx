import { supabase } from "@/db/supabase";

export const fetchCars = async () => {
    try {
        const { data, error } = await supabase.from("cars").select("*");
        if (error) {
            throw error;
        }

        return data || [];

    } catch (error) {
        console.error("Error fetching cars: ", error.message);
        return [];
    }
}

export const deleteCar = (id) => async (dispatch) => {
    try {
        const { error } = await supabase.from("cars").delete().eq("id", id);
        if (error) {
            throw error;
        }
        dispatch({ type: "DELETE_CAR", payload: id });
    } catch (error) {
        console.error("Error deleting car: ", error.message);
    }
}

