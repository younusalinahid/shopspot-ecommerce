package com.ecommerce.repository;

import com.ecommerce.model.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM SearchHistory s WHERE s.user.id = :userId")
    void deleteAllByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}