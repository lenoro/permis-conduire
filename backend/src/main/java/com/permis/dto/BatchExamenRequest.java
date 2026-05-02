package com.permis.dto;

import com.permis.entity.Examen;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class BatchExamenRequest {
    private List<Long> candidatIds;
    private Examen.TypeEpreuve typeEpreuve;
    private LocalDateTime dateExamen;
    private String observation;
}
