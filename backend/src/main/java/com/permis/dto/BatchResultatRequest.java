package com.permis.dto;

import com.permis.entity.Examen;
import lombok.Data;
import java.util.List;

@Data
public class BatchResultatRequest {
    private List<ResultatItem> resultats;

    @Data
    public static class ResultatItem {
        private Long id;
        private Examen.ResultatExamen resultat;
        private String observation;
    }
}
