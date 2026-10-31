package com.ecommerce.repository;

import com.ecommerce.model.InfoPage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InfoPageRepository extends JpaRepository<InfoPage, String> {

    List<InfoPage> findAllByOrderBySectionAscSortOrderAsc();

    List<InfoPage> findAllByVisibleTrueOrderBySectionAscSortOrderAsc();
}
