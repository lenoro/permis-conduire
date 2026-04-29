package com.permis.service;

import com.permis.entity.Document;
import com.permis.repository.CandidatRepository;
import com.permis.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository repo;
    private final CandidatRepository candidatRepo;

    public List<Document> findByCandidat(Long candidatId) {
        return repo.findByCandidatId(candidatId);
    }

    public Document add(Long candidatId, Document doc) {
        doc.setCandidat(candidatRepo.findById(candidatId)
            .orElseThrow(() -> new RuntimeException("Candidat non trouvé: " + candidatId)));
        return repo.save(doc);
    }

    public Document update(Long id, Document updated) {
        Document existing = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Document non trouvé: " + id));
        existing.setTypeDocument(updated.getTypeDocument());
        existing.setEstFourni(updated.getEstFourni());
        existing.setDateRemise(updated.getDateRemise());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
